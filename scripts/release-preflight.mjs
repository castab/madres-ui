#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const tag = process.argv[2];
if (!/^v\d+\.\d+\.\d+$/.test(tag ?? '') || process.argv.length !== 3) {
	console.error('Usage: npm run release:preflight -- vX.Y.Z');
	process.exit(2);
}

let failures = 0;

function run(binary, args) {
	try {
		return execFileSync(binary, args, {
			encoding: 'utf8',
			maxBuffer: 10 * 1024 * 1024,
			windowsHide: true,
			stdio: ['ignore', 'pipe', 'pipe']
		}).trim();
	} catch (error) {
		if (error.code === 'ENOENT') throw new Error(`${binary} is not installed or is not on PATH`);
		const detail = String(error.stderr || error.stdout || error.message).trim();
		throw new Error(`${binary} failed: ${detail.slice(0, 400)}`);
	}
}

function json(binary, args) {
	return JSON.parse(run(binary, args));
}

function check(label, action) {
	try {
		const detail = action();
		console.log(`PASS ${label}${detail ? ` — ${detail}` : ''}`);
		return true;
	} catch (error) {
		failures += 1;
		console.error(`FAIL ${label} — ${error.message}`);
		return false;
	}
}

function expect(condition, message) {
	if (!condition) throw new Error(message);
}

let repo;
check('GitHub repository', () => {
	const remote = run('git', ['remote', 'get-url', 'origin']);
	const match = remote.match(/github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/);
	expect(match, 'origin must point to a GitHub owner/repository');
	repo = match[1];
	return repo;
});

let mainSha;
check('Remote main commit', () => {
	const line = run('git', ['ls-remote', '--heads', 'origin', 'refs/heads/main']);
	mainSha = line.split(/\s+/)[0];
	expect(/^[0-9a-f]{40}$/.test(mainSha), 'could not read origin/main');
	return mainSha.slice(0, 12);
});

check('Release tag and commit are new', () => {
	const refs = run('git', ['ls-remote', '--tags', 'origin', 'refs/tags/v*'])
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			const [sha, ref] = line.split(/\s+/);
			return { sha, name: ref.replace(/^refs\/tags\//, '').replace(/\^\{\}$/, '') };
		});
	expect(!refs.some((ref) => ref.name === tag), `${tag} already exists on origin`);
	if (mainSha) {
		const previous = refs.find((ref) => ref.sha === mainSha);
		expect(!previous, `main commit is already tagged ${previous?.name}`);
	}
	const versions = refs.map((ref) => ref.name).filter((name) => /^v\d+\.\d+\.\d+$/.test(name));
	const compare = (a, b) => {
		const left = a.slice(1).split('.').map(Number);
		const right = b.slice(1).split('.').map(Number);
		for (let index = 0; index < 3; index += 1) {
			if (left[index] !== right[index]) return left[index] - right[index];
		}
		return 0;
	};
	const latest = versions.sort(compare).at(-1);
	expect(!latest || compare(tag, latest) > 0, `${tag} must be newer than ${latest}`);
	return latest ? `latest release is ${latest}` : 'no existing version tags';
});

const ghReady = check('GitHub CLI authentication', () => {
	run('gh', ['api', 'user', '--jq', '.login']);
});

let projectId;
if (ghReady && repo) {
	check('GitHub release credentials', () => {
		const secrets = json('gh', ['secret', 'list', '--repo', repo, '--json', 'name']);
		expect(
			secrets.some((secret) => secret.name === 'RAILWAY_TOKEN'),
			'RAILWAY_TOKEN secret is missing'
		);
		const variables = json('gh', ['variable', 'list', '--repo', repo, '--json', 'name,value']);
		projectId = variables.find((variable) => variable.name === 'RAILWAY_PROJECT_ID')?.value;
		expect(
			/^[0-9a-f-]{36}$/.test(projectId ?? ''),
			'RAILWAY_PROJECT_ID variable is missing or invalid'
		);
		return `project ${projectId}`;
	});

	if (mainSha) {
		check('Main CI and CodeQL', () => {
			const runs = json('gh', [
				'run',
				'list',
				'--repo',
				repo,
				'--commit',
				mainSha,
				'--limit',
				'20',
				'--json',
				'workflowName,status,conclusion,headSha'
			]);
			for (const name of ['CI', 'CodeQL']) {
				const latest = runs.find((run) => run.workflowName === name && run.headSha === mainSha);
				expect(latest, `${name} has not run on ${mainSha.slice(0, 12)}`);
				expect(
					latest.status === 'completed' && latest.conclusion === 'success',
					`${name} is ${latest.status}/${latest.conclusion || 'pending'}`
				);
			}
			return mainSha.slice(0, 12);
		});
	}
}

const railwayReady = check('Railway CLI authentication', () => {
	json('railway', ['whoami', '--json']);
});

if (railwayReady && projectId) {
	let serviceId;
	check('Railway madres-ui service', () => {
		const services = json('railway', [
			'service',
			'list',
			'--project',
			projectId,
			'--environment',
			'production',
			'--json'
		]);
		serviceId = services.find((service) => service.name === 'madres-ui')?.id;
		expect(serviceId, 'madres-ui service is missing from Railway production');
		return serviceId;
	});

	let environments;
	check('Railway environments', () => {
		const result = json('railway', [
			'api',
			`query { project(id: "${projectId}") { environments { edges { node { id name } } } } }`
		]);
		environments = Object.fromEntries(
			result.data.project.environments.edges.map(({ node }) => [node.name, node.id])
		);
		expect(
			environments.development && environments.production,
			'development or production environment is missing'
		);
		return 'development and production found';
	});

	if (serviceId && environments?.development && environments?.production) {
		check('Railway deployment triggers', () => {
			const result = json('railway', [
				'api',
				`query {
				development: serviceInstanceAutoDeployStatus(projectId: "${projectId}", environmentId: "${environments.development}", serviceId: "${serviceId}") { enabled }
				production: serviceInstanceAutoDeployStatus(projectId: "${projectId}", environmentId: "${environments.production}", serviceId: "${serviceId}") { enabled }
			}`
			]);
			expect(result.data.development.enabled === true, 'development auto deploy must be enabled');
			expect(result.data.production.enabled === false, 'production auto deploy must be disabled');
			return 'main → development; tag workflow → production';
		});

		check('Tag workflow target', () => {
			const file = json('gh', [
				'api',
				`repos/${repo}/contents/.github/workflows/deploy.yml?ref=${mainSha}`
			]);
			const workflow = Buffer.from(file.content, 'base64').toString('utf8');
			expect(
				/tags:\s*\[\s*["']v\*\.\*\.\*["']\s*\]/.test(workflow),
				'release workflow must trigger on version tags'
			);
			expect(
				workflow.includes(`--service ${serviceId}`) &&
					workflow.includes('--environment production'),
				'release workflow targets a different service or environment'
			);
		});

		if (mainSha) {
			check('Main deployed to development', () => {
				const deployments = json('railway', [
					'deployment',
					'list',
					'--project',
					projectId,
					'--environment',
					'development',
					'--service',
					serviceId,
					'--limit',
					'20',
					'--json'
				]);
				const deployment = deployments.find((item) => item.meta?.commitHash === mainSha);
				expect(deployment, `no development deployment found for ${mainSha.slice(0, 12)}`);
				if (deployment.status === 'SUCCESS') return deployment.id;
				expect(
					deployment.status === 'SKIPPED' &&
						deployment.meta?.skippedReason === 'No changes to watched files',
					`deployment ${deployment.id} is ${deployment.status}${deployment.meta?.skippedReason ? ` (${deployment.meta.skippedReason})` : ''}`
				);

				const previous = deployments.find(
					(item) => item.status === 'SUCCESS' && /^[0-9a-f]{40}$/.test(item.meta?.commitHash)
				);
				expect(previous, 'no prior successful development commit found');
				const comparison = json('gh', [
					'api',
					`repos/${repo}/compare/${previous.meta.commitHash}...${mainSha}`
				]);
				expect(comparison.status === 'ahead', 'development commit is not an ancestor of main');
				expect(
					Array.isArray(comparison.files) && comparison.files.length < 300,
					'commit comparison is incomplete'
				);
				const buildInputsChanged = comparison.files.some(
					({ filename }) =>
						filename.startsWith('apps/madres-web/') ||
						['package-lock.json', '.npmrc', '.nvmrc'].includes(filename)
				);
				expect(
					!buildInputsChanged,
					'app or build inputs changed since the last successful development deployment'
				);

				if (comparison.files.some(({ filename }) => filename === 'package.json')) {
					const packageAt = (sha) => {
						const file = json('gh', ['api', `repos/${repo}/contents/package.json?ref=${sha}`]);
						const data = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
						delete data.scripts;
						return data;
					};
					expect(
						JSON.stringify(packageAt(previous.meta.commitHash)) ===
							JSON.stringify(packageAt(mainSha)),
						'root package build configuration changed since the last successful development deployment'
					);
				}
				return `Railway skipped ${mainSha.slice(0, 12)}; app build inputs match successful deployment ${previous.id}`;
			});
		}
	}
}

if (failures) {
	console.error(
		`\n${failures} release preflight check${failures === 1 ? '' : 's'} failed. Do not create the tag yet.`
	);
	process.exitCode = 1;
} else {
	console.log(`\nReady to tag ${tag} at main commit ${mainSha}.`);
}

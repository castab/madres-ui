# Releasing madres-ui

## Deployment map

| Event               | Destination                                      | Mechanism                                                                                                                    |
| ------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Merge to `main`     | Railway `development` (`dev.madrestacoshop.com`) | GitHub source integration with auto deploy enabled                                                                           |
| Push a `vX.Y.Z` tag | Railway `production` (`madrestacoshop.com`)      | [Release workflow](.github/workflows/deploy.yml) runs `railway up --environment production`, then publishes a GitHub Release |

The Railway `madres-ui` service exists in both environments. Production's GitHub auto deploy must stay **disabled**; otherwise a merge to `main` could reach production before the tag. The release workflow stamps the `madres-web` package version from the tag in its runner. The version in source control may still show the previous release number.

## Release procedure

1. Merge the feature PR after its CI, end-to-end, and CodeQL checks pass.
2. Wait for the merge commit's `main` CI and CodeQL runs to pass and for the same commit to reach `SUCCESS` in Railway development. A documentation-only merge may be `SKIPPED`; preflight verifies that no app build inputs changed since the last successful development deployment before accepting that result.
3. From the repo root, run `npm run release:preflight -- vX.Y.Z`. This command only reads GitHub, Git, and Railway state. It checks the remote `main` SHA, that the version is new and `main` is not already tagged, required GitHub release credentials, green checks, development deployment, both auto deploy settings, and the workflow on remote `main`. Install and authenticate `gh` and `railway` first (`gh auth status`, `railway whoami`). A working `git push` credential does not automatically authenticate `gh`.
4. Fetch `main` and confirm it still matches the SHA printed by preflight. If it moved, rerun preflight. Tag that exact SHA:

   ```sh
   git fetch origin main --tags
   # Replace SHA_FROM_PREFLIGHT with the full SHA printed by the preflight command.
   git tag -a vX.Y.Z SHA_FROM_PREFLIGHT -m "Release vX.Y.Z"
   git push origin refs/tags/vX.Y.Z
   ```

5. Watch the GitHub **Release** workflow for the tag. It must finish successfully, including **Deploy to Railway production** and **Create GitHub Release**.
6. Check the new Railway production deployment has status `SUCCESS`, and confirm the GitHub Release exists at `https://github.com/castab/madres-ui/releases/tag/vX.Y.Z`.

The release workflow uses the repository secret `RAILWAY_TOKEN` and variable `RAILWAY_PROJECT_ID`. Railway deployment settings are external to Git; the preflight reads their live values. If the release workflow fails, inspect that run and the matching Railway deployment before retrying. Use the workflow's manual dispatch with the **existing tag** when a rerun is needed; do not move a published tag.

Railway can mark a development deployment `SKIPPED` when a merge changes no watched app files. Preflight accepts this only when GitHub's commit comparison shows no changes to the app, lockfile, Node configuration, or root package build configuration since the last successful development deployment. It reports other skips as failures.

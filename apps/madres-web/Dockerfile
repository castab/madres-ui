# syntax=docker/dockerfile:1
#
# Build from the repository root so npm workspaces resolves correctly:
#   docker build -f apps/madres-web/Dockerfile -t madres-web .
#
# The SvelteKit build (adapter-node) produces a fully self-contained bundle with
# no external runtime dependencies, so the final image needs no node_modules at
# all beyond the `build/` output and a minimal package.json for ESM resolution.

FROM node:26-alpine AS base
WORKDIR /repo

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/madres-web/package.json apps/madres-web/package.json
RUN npm ci

FROM deps AS build
COPY apps/madres-web apps/madres-web
RUN npm run build --workspace=madres-web

FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
# Railway's HTTP edge supplies the client address in X-Real-IP. The SvelteKit Node adapter
# uses this for getClientAddress(), including the inquiry rate limit and Turnstile verification.
ENV ADDRESS_HEADER=x-real-ip

RUN addgroup -S madres && adduser -S madres -G madres
COPY --from=build /repo/apps/madres-web/build ./build
COPY --from=build /repo/apps/madres-web/package.json ./package.json
USER madres

EXPOSE 3000
CMD ["node", "build/index.js"]

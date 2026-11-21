# Build tools stay in images: the host needs only Node 24 and Docker.

FROM alpine:3.22 AS object-binaries
ARG TARGETARCH
RUN set -eu; \
    case "$TARGETARCH" in \
      arm64) minio_sha=5c83cd2cf151717ba0243f73e1c7802ff36e272b67144bdd7f1f7d684fd6f03d; mc_sha=14c8c9616cfce4636add161304353244e8de383b2e2752c0e9dad01d4c27c12c ;; \
      amd64) minio_sha=7c5bd8512c6e966455b1d198209358b2d191c77a83ab377c4073281065fb855f; mc_sha=01f866e9c5f9b87c2b09116fa5d7c06695b106242d829a8bb32990c00312e891 ;; \
      *) exit 1 ;; \
    esac; \
    minio_release=RELEASE.2025-09-07T16-13-09Z; \
    mc_release=RELEASE.2025-08-13T08-35-41Z; \
    wget -q -O /minio "https://github.com/minio/minio/releases/download/$minio_release/minio.linux-$TARGETARCH.$minio_release"; \
    wget -q -O /mc "https://github.com/minio/mc/releases/download/$mc_release/mc.linux-$TARGETARCH.$mc_release"; \
    printf '%s  /minio\n%s  /mc\n' "$minio_sha" "$mc_sha" | sha256sum -c -; \
    chmod 755 /minio /mc

FROM alpine:3.22 AS objectstore
COPY --from=object-binaries /minio /mc /usr/local/bin/
ENTRYPOINT ["minio"]

FROM node:24-bookworm-slim AS node-build
WORKDIR /workspace
COPY reading/package.json ./
RUN --mount=type=cache,target=/corepack,sharing=locked \
    corepack enable && COREPACK_HOME=/corepack corepack install && \
    mkdir -p /root/.cache/node/corepack && cp -a /corepack/. /root/.cache/node/corepack/ && rm package.json

FROM eclipse-temurin:25-jdk-noble AS backend
COPY contracts/ /workspace/contracts/
COPY VERSION /workspace/VERSION
COPY infra/java.gradle /workspace/infra/java.gradle
WORKDIR /workspace/backend
COPY backend/ .
RUN --mount=type=cache,target=/root/.gradle sed -i 's/^retries=0/retries=3/' gradle/wrapper/gradle-wrapper.properties && java -classpath gradle/wrapper/gradle-wrapper.jar org.gradle.wrapper.GradleWrapperMain --no-daemon --max-workers=2 :control:bootJar :content:bootJar :index:bootJar

FROM node-build AS reading-deps
WORKDIR /workspace/reading
COPY reading/package.json reading/pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm/store,sharing=locked \
    --mount=type=cache,target=/root/.cache/pnpm,sharing=locked \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store --network-concurrency=8

FROM reading-deps AS reading-build
COPY reading/ .
RUN pnpm build:reader

FROM node-build AS console-deps
WORKDIR /workspace/clients/control-console
COPY clients/control-console/package.json clients/control-console/pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm/store,sharing=locked \
    --mount=type=cache,target=/root/.cache/pnpm,sharing=locked \
    pnpm install --frozen-lockfile --prefer-offline --store-dir=/pnpm/store --network-concurrency=2 --fetch-retries=4 --fetch-timeout=120000

FROM console-deps AS console-build
COPY contracts/openapi.json /workspace/contracts/openapi.json
COPY LICENSE /workspace/LICENSE
COPY clients/control-console/ .
RUN pnpm build

# Reading frontend: Astro SSR with the Node adapter (standalone). Upstreams come from EDITION_CONTENT_ORIGIN / EDITION_CONTROL_ORIGIN.
FROM node:24-bookworm-slim AS reading
WORKDIR /app
COPY --from=reading-build /workspace/reading/dist-reader/ dist-reader/
COPY --from=reading-build /workspace/reading/node_modules/ node_modules/
ENV HOST=0.0.0.0 PORT=8096 NODE_ENV=production
EXPOSE 8096
CMD ["node", "dist-reader/server/entry.mjs"]

FROM node-build AS scripts
WORKDIR /workspace/infra
COPY infra/package.json infra/pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm/store,sharing=locked \
    --mount=type=cache,target=/root/.cache/pnpm,sharing=locked \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store --network-concurrency=8 --prod

FROM eclipse-temurin:25-jdk-noble AS app
RUN apt-get update && apt-get install -y --no-install-recommends openssl postgresql-client && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
COPY VERSION /workspace/VERSION
COPY --from=scripts /usr/local/bin/node /usr/local/bin/node
COPY --from=scripts /workspace/infra/node_modules/ infra/node_modules/
COPY infra/ infra/
COPY --from=backend /workspace/backend/apps/control/build/libs/*.jar backend/apps/control/build/libs/
COPY --from=backend /workspace/backend/apps/content/build/libs/*.jar backend/apps/content/build/libs/
COPY --from=backend /workspace/backend/apps/index/build/libs/*.jar backend/apps/index/build/libs/
ENTRYPOINT ["node", "infra/edition.ts", "diagnose"]

FROM caddy:2 AS web
COPY infra/deployment/local.Caddyfile /etc/caddy/Caddyfile
COPY --from=console-build /workspace/clients/control-console/dist/ /srv/console/

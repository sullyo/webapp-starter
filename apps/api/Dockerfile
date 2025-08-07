FROM oven/bun:1 AS base
WORKDIR /app

# Install pnpm
RUN bun install -g pnpm@9.15.6
RUN bun install -g turbo

# First stage to prune monorepo
FROM base AS pruner
COPY . .
RUN turbo prune api --docker

# Install dependencies
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project
FROM installer AS builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY . .
RUN pnpm turbo --filter=api... build

# Production image
FROM base AS runner
WORKDIR /app
# Copy the built application
COPY --from=builder /app/apps/api ./apps/api
# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules
# Copy workspace packages
COPY --from=builder /app/packages ./packages

USER bun
EXPOSE 3004
WORKDIR /app/apps/api
CMD ["bun", "run", "src/index.ts"]
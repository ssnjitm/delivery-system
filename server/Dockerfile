# Stage 1: Build Phase
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json eslint.config.js .prettierrc ./
COPY src ./src

# Build production TypeScript output (now using npx via package.json)
RUN npm run build

RUN npm prune --production

# Stage 2: Final Production Runtime Engine
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "dist/index.js"]
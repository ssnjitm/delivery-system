# Stage 1: Build Phase
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies first (to leverage build caching)
COPY package*.json ./
RUN npm ci

# Copy configuration and source code
COPY tsconfig.json eslint.config.js .prettierrc ./
COPY src ./src

# Build production TypeScript output
RUN npm run build

# Remove development dependencies to save space
RUN npm prune --production


# Stage 2: Final Production Runtime Engine
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Enforce secure node runtime environments

ENV NODE_ENV=production

# Copy built production assets from builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Start the application
# (Make sure 'dist/index.js' matches your actual main compiled entry file!)
CMD ["node", "dist/index.js"]
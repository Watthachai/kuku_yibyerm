# /frontend/Dockerfile

# Stage 1: Install dependencies
FROM node:24-alpine3.21 AS deps
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Stage 2: Build the application
FROM node:24-alpine3.21 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Environment variable for API URL can be set here or in docker-compose
# ENV NEXT_PUBLIC_API_URL=http://backend:8080/api
RUN yarn build

# Stage 3: Production image
FROM node:24-alpine3.21 AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER node

EXPOSE 3000

# The command to run the Next.js app
CMD ["yarn", "start"]
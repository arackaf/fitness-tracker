FROM node:24-alpine AS base

WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install --force

FROM deps AS build
COPY . .
RUN npm run build
RUN npm prune --omit=dev --force

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NITRO_PORT=8080
ENV NITRO_HOST=0.0.0.0

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output

EXPOSE 8080

CMD ["node", ".output/server/index.mjs"]

FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@9

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/products/package.json apps/products/
COPY packages/package.json packages/
RUN --mount=type=cache,target=/pnpm-store pnpm install --frozen-lockfile --store-dir=/pnpm-store

COPY . .
RUN pnpm --filter @acme/products build

FROM nginx:alpine
COPY --from=build /app/apps/products/dist /usr/share/nginx/html
COPY apps/products/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

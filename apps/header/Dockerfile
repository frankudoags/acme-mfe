FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@9

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/header/package.json apps/header/
COPY packages/package.json packages/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @acme/header build

FROM nginx:alpine
COPY --from=build /app/apps/header/dist /usr/share/nginx/html
COPY apps/header/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

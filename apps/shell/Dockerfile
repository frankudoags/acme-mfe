FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@9

ARG HEADER_REMOTE
ARG PRODUCTS_REMOTE
ARG CART_REMOTE
ENV HEADER_REMOTE=$HEADER_REMOTE
ENV PRODUCTS_REMOTE=$PRODUCTS_REMOTE
ENV CART_REMOTE=$CART_REMOTE

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/shell/package.json apps/shell/
COPY packages/package.json packages/
RUN --mount=type=cache,target=/pnpm-store pnpm install --frozen-lockfile --store-dir=/pnpm-store

COPY . .
RUN pnpm --filter @acme/shell build

FROM nginx:alpine
COPY --from=build /app/apps/shell/dist /usr/share/nginx/html
COPY apps/shell/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

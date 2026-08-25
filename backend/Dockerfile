FROM rust:1-alpine AS build
WORKDIR /app
RUN apk add --no-cache musl-dev
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=build /app/target/release/acme-api /usr/local/bin/acme-api
EXPOSE 8080
CMD ["acme-api"]

use axum::{
    extract::State,
    http::{Method, StatusCode},
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use sqlx::mysql::MySqlPoolOptions;
use sqlx::MySqlPool;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

#[derive(sqlx::FromRow, Serialize, Clone)]
struct Product {
    id: String,
    name: String,
    price: f64,
    description: String,
    image: String,
}

#[derive(Deserialize)]
struct CartItem {
    id: String,
    price: f64,
    qty: u32,
}

#[derive(Deserialize)]
struct CheckoutRequest {
    items: Vec<CartItem>,
}

#[derive(Serialize)]
struct CheckoutResponse {
    message: String,
    total: f64,
}

async fn ensure_schema(pool: &MySqlPool) -> sqlx::Result<()> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS products (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DOUBLE NOT NULL,
            description TEXT,
            image VARCHAR(64)
        )",
    )
    .execute(pool)
    .await?;

    let seeds: [(String, &str, f64, &str, &str); 5] = [
        (
            "p1".into(),
            "Mechanical Keyboard",
            129.99,
            "Tactile switches, hot-swappable",
            "⌨️",
        ),
        (
            "p2".into(),
            "Wireless Mouse",
            49.99,
            "Ergonomic, 2.4GHz + BT",
            "🖱️",
        ),
        (
            "p3".into(),
            "27\" Monitor",
            349.0,
            "1440p, 144Hz IPS panel",
            "🖥️",
        ),
        (
            "p4".into(),
            "USB-C Hub",
            39.5,
            "7-in-1 with HDMI and PD",
            "🔌",
        ),
        (
            "p5".into(),
            "Noise-Cancelling Headset",
            199.0,
            "ANC, 40h battery life",
            "🎧",
        ),
    ];

    for (id, name, price, desc, image) in seeds {
        sqlx::query(
            "INSERT IGNORE INTO products (id, name, price, description, image)
             VALUES (?, ?, ?, ?, ?)",
        )
        .bind(id)
        .bind(name)
        .bind(price)
        .bind(desc)
        .bind(image)
        .execute(pool)
        .await?;
    }

    Ok(())
}

async fn products(State(pool): State<Arc<MySqlPool>>) -> Result<Json<Vec<Product>>, StatusCode> {
    let rows = sqlx::query_as::<_, Product>(
        "SELECT id, name, price, description, image FROM products ORDER BY id",
    )
    .fetch_all(pool.as_ref())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(rows))
}

async fn checkout(
    State(pool): State<Arc<MySqlPool>>,
    body: Json<CheckoutRequest>,
) -> Result<Json<CheckoutResponse>, StatusCode> {
    let mut total = 0.0;
    for item in &body.items {
        let exists: Option<i64> = sqlx::query_scalar("SELECT COUNT(*) FROM products WHERE id = ?")
            .bind(&item.id)
            .fetch_one(pool.as_ref())
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        if exists.unwrap_or(0) == 0 {
            return Err(StatusCode::BAD_REQUEST);
        }
        total += item.price * item.qty as f64;
    }

    Ok(Json(CheckoutResponse {
        message: format!("Order placed! {} item(s) for ${total:.2}", body.items.len()),
        total,
    }))
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "mysql://root:root@localhost:3306/acme".to_string());

    let pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("failed to connect to MySQL");

    ensure_schema(&pool).await.expect("failed to init schema");

    let pool = Arc::new(pool);

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/products", get(products))
        .route("/api/cart/checkout", post(checkout))
        .layer(cors)
        .with_state(pool);

    let addr = "0.0.0.0:8080";
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("API listening on http://{addr}");
    axum::serve(listener, app).await.unwrap();
}

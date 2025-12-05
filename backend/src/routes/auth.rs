use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use axum::{extract::State, http::StatusCode, response::IntoResponse, routing::post, Json, Router};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use validator::Validate;

use crate::{
    db::AppState,
    error::AppError,
    models::{Admin, AdminInfo, Claims, LoginRequest, LoginResponse},
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/login", post(login))
        .route("/register", post(register_admin))
}

/// Login handler
async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    // Find admin by username
    let admin = sqlx::query_as::<_, Admin>(
        "SELECT id, username, password_hash, created_at FROM admins WHERE username = $1",
    )
    .bind(&payload.username)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::InvalidCredentials)?;

    // Verify password
    let parsed_hash = PasswordHash::new(&admin.password_hash)
        .map_err(|_| AppError::InternalError("Invalid password hash".to_string()))?;

    Argon2::default()
        .verify_password(payload.password.as_bytes(), &parsed_hash)
        .map_err(|_| AppError::InvalidCredentials)?;

    // Generate JWT token
    let claims = Claims::new(
        admin.id,
        admin.username.clone(),
        state.config.jwt_expiration,
    );

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.config.jwt_secret.as_ref()),
    )
    .map_err(|_| AppError::InternalError("Token generation failed".to_string()))?;

    let expires_at = Utc::now() + Duration::seconds(state.config.jwt_expiration);

    Ok(Json(LoginResponse {
        token,
        expires_at,
        user: AdminInfo {
            id: admin.id,
            username: admin.username,
        },
    }))
}

/// Register admin (should only work if no admin exists)
async fn register_admin(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    // Check if admin already exists
    let existing = sqlx::query("SELECT 1 FROM admins LIMIT 1")
        .fetch_optional(&state.pool)
        .await?;

    if existing.is_some() {
        return Err(AppError::Conflict(
            "Admin already exists. Registration is disabled.".to_string(),
        ));
    }

    // Hash password
    let salt = SaltString::generate(OsRng);
    let password_hash = Argon2::default()
        .hash_password(payload.password.as_bytes(), &salt)
        .map_err(|_| AppError::InternalError("Password hashing failed".to_string()))?
        .to_string();

    // Create admin
    let admin = sqlx::query_as::<_, Admin>(
        "INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING id, username, password_hash, created_at"
    )
    .bind(&payload.username)
    .bind(&password_hash)
    .fetch_one(&state.pool)
    .await?;

    Ok((StatusCode::CREATED, Json(admin)))
}

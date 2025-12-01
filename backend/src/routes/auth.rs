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
    let admin = sqlx::query_as::<_, Admin>("SELECT * FROM admins WHERE username = $1")
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
        &EncodingKey::from_secret(state.config.jwt_secret.as_bytes()),
    )?;

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

/// Register admin handler (for initial setup - should be protected in production)
async fn register_admin(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload.validate()?;

    // Check if admin already exists
    let existing: Option<(i64,)> =
        sqlx::query_as("SELECT COUNT(*) FROM admins WHERE username = $1")
            .bind(&payload.username)
            .fetch_optional(&state.pool)
            .await?;

    if let Some((count,)) = existing {
        if count > 0 {
            return Err(AppError::Conflict(
                "Admin with this username already exists".to_string(),
            ));
        }
    }

    // Hash password
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(payload.password.as_bytes(), &salt)
        .map_err(|e| AppError::InternalError(format!("Failed to hash password: {}", e)))?
        .to_string();

    // Create admin
    let admin = sqlx::query_as::<_, Admin>(
        "INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING *",
    )
    .bind(&payload.username)
    .bind(&password_hash)
    .fetch_one(&state.pool)
    .await?;

    Ok((
        StatusCode::CREATED,
        Json(AdminInfo {
            id: admin.id,
            username: admin.username,
        }),
    ))
}

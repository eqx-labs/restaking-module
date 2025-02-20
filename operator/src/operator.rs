use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use eyre::Result;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use ethers::{
    providers::{Provider, Http, Middleware},
    types::{H256, U256},
};
use crate::PrivateKeySigner;
use k256::ecdsa::SigningKey;

// Request and response types
#[derive(Debug, Serialize, Deserialize)]
pub struct VerificationRequest {
    pub transaction_hash: String,
    pub block_number: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerificationResponse {
    pub is_included: bool,
    pub proposer_index: Option<u64>,
    pub block_number: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct BeaconApiResponse {
    status: String,
    data: Vec<BlockData>,
}

#[derive(Debug, Serialize, Deserialize)]
struct BlockData {
    pos_consensus: PosConsensus,
}

#[derive(Debug, Serialize, Deserialize)]
struct PosConsensus {
    proposer_index: u64,
}

// Application state
#[derive(Clone)]
pub struct AppState {
    provider: Arc<Provider<Http>>,
    client: Arc<reqwest::Client>,
}

impl AppState {
    pub fn new(rpc_url: &str) -> Result<Self> {
        let provider = Provider::<Http>::try_from(rpc_url)
            .map_err(|e| eyre::eyre!("Failed to create provider: {}", e))?;

        Ok(Self {
            provider: Arc::new(provider),
            client: Arc::new(reqwest::Client::new()),
        })
    }
}

// Transaction verification functions
async fn is_transaction_in_block(
    provider: &Provider<Http>,
    tx_hash: &str,
    block_number: &str,
) -> Result<bool> {
    let tx_hash = tx_hash.parse::<H256>()?;
    
    let tx = provider
        .get_transaction(tx_hash)
        .await?;

    match tx {
        Some(tx) => {
            let tx_block_number = tx.block_number.unwrap_or_default();
            let expected_block = block_number.parse::<U256>()?;
            Ok(tx_block_number.as_u64() == expected_block.as_u64())
        }
        None => Ok(false),
    }
}

async fn get_block_proposer(
    client: &reqwest::Client,
    block_number: &str,
) -> Result<Option<u64>> {
    let url = format!(
        "https://beaconcha.in/api/v1/execution/block/{}",
        block_number
    );

    let response = client
        .get(&url)
        .send()
        .await?;

    let beacon_response: BeaconApiResponse = response.json().await?;

    Ok(beacon_response
        .data
        .first()
        .map(|block| block.pos_consensus.proposer_index))
}

// API handlers
async fn verify_transaction(
    State(state): State<AppState>,
    Json(request): Json<VerificationRequest>,
) -> Result<Json<VerificationResponse>, String> {
    let is_included = is_transaction_in_block(
        &state.provider,
        &request.transaction_hash,
        &request.block_number,
    )
    .await
    .map_err(|e| e.to_string())?;

    let proposer_index = if is_included {
        get_block_proposer(&state.client, &request.block_number)
            .await
            .map_err(|e| e.to_string())?
    } else {
        None
    };

    Ok(Json(VerificationResponse {
        is_included,
        proposer_index,
        block_number: request.block_number,
    }))
}

// Health check endpoint
async fn health_check() -> &'static str {
    "OK"
}



// Router setup
pub fn operator_router(wallet: PrivateKeySigner) -> Router {
    let state = AppState::new("https://eth.llamarpc.com")
        .expect("Failed to create app state");
        
    Router::new()
        .route("/verify", post(verify_transaction))
        .route("/health", get(health_check))
        .with_state(state)
}
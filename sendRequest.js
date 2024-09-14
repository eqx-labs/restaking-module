// sendRequest.js
const { ethers } = require("ethers");

// Replace with your local Anvil RPC URL
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

// Replace with the private key of the account you want to use
const privateKey = "0xYOUR_PRIVATE_KEY";
const wallet = new ethers.Wallet(privateKey, provider);

// Replace with your deployed contract address
const contractAddress = "0xYOUR_CONTRACT_ADDRESS";

// ABI of the SquareNumberDSS contract
const abi = [
    "function generateTaskRequest((uint256 value)) external",
    // Add other function signatures if needed
];

const contract = new ethers.Contract(contractAddress, abi, wallet);

async function sendRequest() {
    const taskRequest = { value: 4 }; // Example value to square

    try {
        const tx = await contract.generateTaskRequest(taskRequest);
        console.log("Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("Transaction mined:", receipt.transactionHash);
    } catch (error) {
        console.error("Error sending request:", error);
    }
}

sendRequest();


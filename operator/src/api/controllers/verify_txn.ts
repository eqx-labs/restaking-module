import Web3 from "web3";
import axios from "axios";
import { evmBlockScanner, getProvider, getContractInstance } from "./event";
import { response } from "express";
import { ethers } from "ethers";
import abi from "../../utils/contract/abis/abi.json";

// Initialize Web3 with the Ethereum provider
const web3 = new Web3("https://eth.llamarpc.com");

// Define types for the results from `evmBlockScanner`
interface ScannerResult {
  txnHash: string;
  blockNumber: string; // Block number as string since it comes from logs in BigNumber format
}
interface PosConsensus {
  proposerIndex: number;
}

interface BlockData {
  posConsensus: PosConsensus;
}

// Define the return type of the proposer API
interface ProposerResponse {
  status: string;
  data: BlockData[]; // Updated to be an array
}

// Function to check if a transaction is included in a given block
async function isTxIncludedInGivenBlock(
  txHash: string,
  blockNumber: string
): Promise<boolean> {
  try {
    const transaction = await web3.eth.getTransaction(txHash);

    // Convert blockNumber and transaction.blockNumber to BigInt for comparison
    const blockNumberBigInt = BigInt(blockNumber);
    const transactionBlockNumber = BigInt(transaction.blockNumber!); // Add ! since blockNumber may be null

    // Check if the transaction exists and is in the expected block
    if (transaction && transactionBlockNumber === blockNumberBigInt) {
      return true; // Transaction is included in the block
    }
    return false; // Transaction is not in the block
  } catch (error: any) {
    console.error(`Error while checking transaction: ${error.message}`);
    return false;
  }
}

// Function to get the proposer (validator) for a given block
async function getProposerForBlock(
  blockNumber: string
): Promise<number | null> {
  try {
    const response = await axios.get<ProposerResponse>(
      `https://beaconcha.in/api/v1/execution/block/${blockNumber}`
    );

    // Ensure that the 'data' array is not empty before accessing the first element
    if (response.data.data.length > 0) {
      const proposerIndex = response.data.data[0].posConsensus.proposerIndex;
      console.log(
        `Validator proposer for block ${blockNumber}: ${proposerIndex}`
      );
      return proposerIndex;
    } else {
      console.warn(`No data found for block ${blockNumber}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching proposer for block ${blockNumber}:`, error);
    return null;
  }
}

// Main function to execute both operations
const verify_txn_controller = async () => {
  let result = [];
  try {
    console.log("verifer started");
    const results: ScannerResult[] = await evmBlockScanner();

    if (results.length === 0) {
      throw new Error("No results found from evmBlockScanner");
    }
    console.log("result", results[0]);
    const { txnHash, blockNumber } = results[0];

    console.log("working", txnHash, blockNumber);

    if (!txnHash || !blockNumber) {
      throw new Error("Transaction hash or block number is missing in results");
    }

    const isIncluded = await isTxIncludedInGivenBlock(txnHash, blockNumber);
    console.log(
      `Transaction is included in block ${blockNumber}: ${isIncluded}`
    );

    if (isIncluded) {
      const proposerIndex = await getProposerForBlock(blockNumber);
      if (proposerIndex !== null) {
        
        //add your private key to call the contract getProposerTxnValid function 
        const wallet = new ethers.Wallet(
          "private_ket",
          getProvider()
        );

        // Create a contract instance
        const contract = new ethers.Contract(
          "0x300CBd08350C47452B92eA4D13d4374E0ad59d59",
          abi,
          wallet
        );

        await contract.getProposerTxnValid(proposerIndex, isIncluded);

        contract.on("Received", (msgFromContract, proposer) => {
          console.log(
            `Event Received: msgFromContract=${msgFromContract}, proposer=${proposer}`
          );
        });

        console.log("Successfully called getProposerTxnValid on the contract");
        return `Transaction is included in block ${blockNumber}: ${isIncluded} \n Proposer index for block ${blockNumber}: ${proposerIndex}`;
      } else {
        return `Transaction is included in block ${blockNumber}: ${isIncluded}`;
      }
    } else {
      console.log(`Transaction Hash is not included in block ${blockNumber}.`);
    }
  } catch (error) {
    console.error("Error in main execution:", error);
  }
};

export default verify_txn_controller;

// Transaction is included in block 20770459: true
// Validator proposer for block 20770459: 1447003

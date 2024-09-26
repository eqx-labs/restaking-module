import Web3 from "web3";
import axios from "axios";
import  {VerifyResponse,TaskResponse,Task} from ".././models/verify";
import { response } from "express";
import { ethers } from "ethers";
import abi from "../../utils/contract/abis/abi.json";
import { client } from "@/utils/contract/contract";
import { verifiredTasks } from "@/storage/task";
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

export async function signObject(completedTask: VerifyResponse): Promise<string> {
	const dataString = JSON.stringify(completedTask);
	const signature = await client.signMessage({ message: dataString });
	return signature as string;
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
const verify_txn_controller = async (txnHash: any, blockNumber: any) => {
  let result = [];
  try {
    const completedTask = await runTask(txnHash,blockNumber);
    const signature = await signObject(completedTask);
    console.log("verifer blockNumber", txnHash, blockNumber);
    return {
      completedTask: completedTask,
      publicKey: client.account.address,
      signature: signature,
    } as TaskResponse;



  
  } catch (error) {
    console.error("Error in main execution:", error);
  }
};


export async function runTask(txnHash: string, blockNumber: string): Promise<VerifyResponse> {
  // Await the taskComputation call to get the resolved value
  const taskResponse = await taskComputation(txnHash, blockNumber);
  
  // Now taskResponse contains the actual response, so you can access its properties
  const completedTaskVal: VerifyResponse = {
    transactionStatus: taskResponse.transactionStatus,
    proposal: taskResponse.proposal, // Optional
  };
  
  // Push completed task into the array
  verifiredTasks.push(completedTaskVal);
  
  // Return the completed task value
  return completedTaskVal;
}


export async function taskComputation(
  txnHash: string,
  blockNumber: string
): Promise<VerifyResponse> {
  try {
    // Check if transaction hash or block number is missing
    if (!txnHash || !blockNumber) {
      throw new Error("Transaction hash or block number is missing in results");
    }

    // Check if the transaction is included in the specified block
    const isIncluded = await isTxIncludedInGivenBlock(txnHash, blockNumber);
    console.log(`Transaction is included in block ${blockNumber}: ${isIncluded}`);

    // If the transaction is included, get the proposer for the block
    if (isIncluded) {
      const proposerIndex = await getProposerForBlock(blockNumber);

      // Prepare the response based on whether the proposer is found
      const verifyResponse: VerifyResponse = {
        transactionStatus: `Transaction is included in block ${blockNumber}`,
        proposal: proposerIndex !== null 
          ? `Proposer index for block ${blockNumber}: ${proposerIndex}` 
          : undefined,
      };

      return verifyResponse;

    } else {
      // If the transaction is not included, return the appropriate response
      return {
        transactionStatus: `Transaction is not included in block ${blockNumber}`,
        proposal: undefined,
      };
    }
  } catch (error:any) {
    console.error(`Error in taskComputation: ${error}`);
    throw new Error(`Failed to compute task: ${error}`);
  }
}

export default verify_txn_controller;

// Transaction is included in block 20770459: true
// Validator proposer for block 20770459: 1447003

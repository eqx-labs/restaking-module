import { ethers, Contract, providers, EventFilter } from "ethers";
import abi from "../../utils/contract/abis/abi.json";

// Function to get the provider
export const getProvider = (): providers.JsonRpcProvider => {
  const rpc = "https://eth-sepolia-public.unifra.io";
  let provider = new ethers.providers.JsonRpcProvider(rpc);
  return provider;
};

// Function to get the contract instance
export  const getContractInstance = async (): Promise<Contract> => {
  let provider = getProvider();
  let address = "0x300CBd08350C47452B92eA4D13d4374E0ad59d59";
  let contract = new ethers.Contract(address, abi, provider);

  return contract;
};

// Function to get logs with pagination
const getLogs = async (
  contract: Contract,
  filter: EventFilter,
  fromBlock: number,
  toBlock: number
): Promise<ethers.providers.Log[]> => {
  const interval = 1000;
  const provider = contract.provider as providers.JsonRpcProvider;
  const allLogs: ethers.providers.Log[] = [];
  try {
    for (let i = fromBlock; i < toBlock; i += interval) {
      const logs = await provider.getLogs({
        ...filter,
        fromBlock: i,
        toBlock: Math.min(i + interval, toBlock),
      });
      allLogs.push(...logs);
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
  }
  return allLogs;
};

// Define the result interface for better type safety
interface ScannerResult {
  txnHash: string;
  blockNumber: string;
}

// Main function to scan blocks and parse logs
export const evmBlockScanner = async (): Promise<ScannerResult[]> => {
  const results: ScannerResult[] = [];
  try {
    const fromBlockNumber = 6714178;

    const provider = getProvider();
    const toBlockNumber = await provider.getBlockNumber();
    console.log("toblock", toBlockNumber);

    const contract = await getContractInstance();
    const filter = contract.filters.TxnVerificationResult();

    const logs = await getLogs(
      contract,
      filter,
      fromBlockNumber,
      toBlockNumber
    );

    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      const parsedLastLog = contract.interface.parseLog(lastLog);
      const txnHash: string = parsedLastLog.args[0];
      const blockNumber: string = parsedLastLog.args[1].toString(); // Convert BigNumber to string

      console.log("Last Transaction Hash:", txnHash);
      console.log("Last Block Number:", blockNumber);

      results.push({ txnHash, blockNumber });
    }
  } catch (e) {
    console.error("Error in block scanner:", e);
  }
  return results;
};

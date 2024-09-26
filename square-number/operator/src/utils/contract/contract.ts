import { Address, createTestClient, getContract, http, publicActions, walletActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";

import { core as coreAddress, squareNumberDSS as dssAddress } from "@/../../contracts/contract-addresses.json";
import { env } from "@/config";

import { coreAbi } from "./abis/coreAbi";
import { squareNumberDssAbi } from "./abis/squareNumberDSSAbi";
import { verifyDssAbi } from "./abis/verifyDssAbi";
// TODO change client based on env.NODE_ENV
export const client = createTestClient({
	account: privateKeyToAccount(env.PRIVATE_KEY as `0x${string}`),
	chain: foundry,
	mode: "anvil",
	transport: http(env.RPC_URL),
})
	.extend(publicActions)
	.extend(walletActions);

export const dssContractAddress = dssAddress;
export const dssVerifyContractAddress = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";

export const dssContract = getContract({
	address: dssAddress as Address,
	abi: squareNumberDssAbi,
	client: client,
});

export const dssVerifyContract = getContract({
	address: dssVerifyContractAddress as Address,
	abi: verifyDssAbi,
	client: client,
});


export const coreContract = getContract({
	address: coreAddress as Address,
	abi: coreAbi,
	client: client,
});

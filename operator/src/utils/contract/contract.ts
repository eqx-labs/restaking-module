import { Address, createTestClient, getContract, http, publicActions, walletActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";

import { core as coreAddress, squareNumberDSS as dssAddress } from "@/../../contracts/contract-addresses.json";
import { env } from "@/config";

import { coreAbi } from "./abis/coreAbi";
import { squareNumberDssAbi } from "./abis/squareNumberDSSAbi";

// TODO change client based on env.NODE_ENV
export const client = createTestClient({
	account: privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'),
	chain: foundry,
	mode: "anvil",
	transport: http(env.RPC_URL),
})
	.extend(publicActions)
	.extend(walletActions);

export const dssContractAddress = dssAddress;

export const dssContract = getContract({
	address: dssAddress as Address,
	abi: squareNumberDssAbi,
	client: client,
});

export const coreContract = getContract({
	address: coreAddress as Address,
	abi: coreAbi,
	client: client,
});

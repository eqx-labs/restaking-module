import { Address, Hex, verifyMessage } from "viem";

import { ServiceResponse } from "@/api/models";
import { Task, TaskRequest, TaskResponse, TaskResponseSchema } from "@/api/models/Task";
import {VerifyResponse} from ".././models/verify";
import { env } from "@/config";
import { logger } from "@/server";
import { registeredOperators } from "@/storage/operators";
import { dssContract, verifyContract } from "@/utils/contract/contract";
import { getOperatorStakeMapping } from "@/utils/contract/interactions/core";
import { readBlockNumberFromFile, writeBlockNumberToFile } from "@/utils/file";

export function startTaskServices() {
	logger.info("Listening for task request events");
	setInterval(watchForTaskEvents, env.HEARTBEAT);
	setInterval(watchForTransactionVerifications, env.HEARTBEAT);
}

async function watchForTaskEvents() {
	const nextBlockToCheck = await readBlockNumberFromFile(env.CONTRACTS_JSON);
	const events = await dssContract.getEvents.TaskRequestGenerated({ fromBlock: nextBlockToCheck });

	const taskRequests: TaskRequest[] = events.map((event: any) => ({
		task: { value: Number(event.args.taskRequest.value) } as Task,
		blockNumber: Number(event.blockNumber),
	}));

	if (registeredOperators.length > 0) {
		for (const taskRequest of taskRequests) {
			const responses = await sendTaskToAllOperators(taskRequest.task);
			const blockNumber = taskRequest.blockNumber!;
			const taskResponse = { response: responses };

			await dssContract.write.submitTaskResponse([taskRequest.task, taskResponse]);
			await writeBlockNumberToFile(env.CONTRACTS_JSON, blockNumber + 1);
		}
	} else {
		logger.warn("No operators are registered to handle tasks.");
	}
}

async function watchForTransactionVerifications() {
	try {

		const nextBlockToCheck = await readBlockNumberFromFile(env.CONTRACTS_JSON);
		const events = await verifyContract.getEvents.TxnVerificationResult({ fromBlock: nextBlockToCheck });



		const taskRequests: any = events.map((event: any) => ({

			task: {
				txnHash: event.args.txnHash,
				blockNumber: Number(event.args.blockNumber)
			},
		}));


		console.log("taskRequests", taskRequests);

		if (registeredOperators.length > 0) {
			for (const taskRequest of taskRequests) {
				const responses = await sendTaskVerifyToAllOperators(taskRequest.task);
				console.log("respnse coming",responses);
				const blockNumber = taskRequest.blockNumber!;
				const taskResponse = { response: responses };
				console.log("taskRequest working dine ",taskResponse.response[0].completedTask)


				await verifyContract.write.submitTaskResponse([taskRequest.task, taskResponse.response[0]]);
				await writeBlockNumberToFile(env.CONTRACTS_JSON, blockNumber + 1);

				logger.info(`Task response for block ${blockNumber} submitted successfully.`);
			}
		} else {
			logger.warn("No operators registered for verification.");
		}
	} catch (error: any) {
		logger.error(`Error in watchForTransactionVerifications: ${error.message}`);
	}
}

async function sendTaskToAllOperators(task: Task): Promise<number> {
	let operatorResponses: TaskResponse[] = await Promise.all(
		registeredOperators.map(async (operator) => {
			try {
				const response = await fetch(operator.url + "/task", {
					method: "POST",
					body: JSON.stringify(task),
					headers: { "Content-Type": "application/json" },
				});
				const responseJson = await response.json();
				const serviceResponse: any = (responseJson as ServiceResponse<TaskResponse>).responseObject;
				return {
					completedTask: serviceResponse.completedTask,
					publicKey: serviceResponse.publicKey,
					signature: serviceResponse.signature,
				} as TaskResponse;
			} catch (e) {
				logger.error(`Error sending task to ${operator.url}: ${e}`);
				return undefined as unknown as TaskResponse;
			}
		})
	);

	// Verify operator responses asynchronously
	operatorResponses = await Promise.all(
		operatorResponses.filter(async (response) => {
			return (
				response &&
				(await verifyMessage({
					address: response.publicKey as Address,
					message: JSON.stringify(response.completedTask),
					signature: response.signature as Hex,
				}))
			);
		})
	);

	// Map to aggregate operator responses by stake
	const responseMap: Map<number, bigint> = new Map();
	const [operatorStakes, totalStake] = await getOperatorStakeMapping(
		operatorResponses.map((response) => response.publicKey!),
		0n
	);

	// Aggregate responses by operator stakes
	for (const operator of operatorResponses) {
		const operatorResponse = operator.completedTask!.response!;
		const existingStake = responseMap.get(operatorResponse) || 0n;
		responseMap.set(operatorResponse, existingStake + operatorStakes.get(operator.publicKey!)!);
	}

	// Determine the most frequent response by stake
	const mostFrequentResponse = [...responseMap.entries()].reduce((a, b) => (b[1] > a[1] ? b : a));

	// Check if the majority stake is reached
	if (mostFrequentResponse[1] < totalStake / 2n) {
		throw new Error("Majority not reached");
	}

	return mostFrequentResponse[0];
}


async function sendTaskVerifyToAllOperators(task: Task): Promise<TaskResponse[]> {
	let operatorResponses: TaskResponse[] = await Promise.all(
	  registeredOperators.map(async (operator) => {
		try {
		  const response = await fetch(`${operator.url}/verify`, {
			method: "POST",
			body: JSON.stringify(task),
			headers: { "Content-Type": "application/json" },
		  });
		  
		  const responseJson = await response.json();
		  console.log("responseJson", responseJson);
  
		  const serviceResponse: any = (responseJson as ServiceResponse<TaskResponse>).responseObject;

  
		  console.log("ServiceRes,", serviceResponse);
		  return serviceResponse;
		} catch (e) {
		  console.error(`Error in sendTaskVerifyToAllOperators: ${e}`);
		  return undefined as unknown as TaskResponse; // Ensure to return a compatible type
		}
	  })
	);
  
	// Filter out undefined responses
	
	operatorResponses = operatorResponses.filter(async (response) => {
        if (!response) {
            return false; // Exclude null responses
        }
        

        const isVerified = await verifyMessage({
            address: response?.publicKey as any,
            message: JSON.stringify(response.completedTask),
            signature: response.signature as any,
        });
		console.log("isVerified",isVerified);
        return isVerified;
    });


    // Map to aggregate operator responses by stake
    const responseMap: Map<TaskResponse, String> = new Map();
    const [operatorStakes, totalStake] = await getOperatorStakeMapping(
        operatorResponses.map((response) => response.publicKey!),
        0n
    );


	console.log("operatorResponses",operatorResponses);
	return operatorResponses;
}
    // Aggregate responses by operator stakes
	// for (const operator of operatorResponses) {
	// 	console.log("operator", operator);
		
	// 	// Assuming completedTask has a transactionStatus or another property to be used as the key
	// 	const operatorResponseKey = operator.completedTask; // Change this based on your structure
	// 	const existingStake = responseMap.get(operatorResponseKey.response) || 0n; // Use the correct key
	// 	const stakeAmount = operatorStakes.get(operator.publicKey!) || 0n; // Get the stake amount
		
	// 	// Update the responseMap
	// 	responseMap.set(operatorResponseKey, existingStake + stakeAmount);
	// }
    // // Log the response map before aggregation
    // console.log("Response map before aggregation:", Array.from(responseMap.entries()));

    // // Determine the most frequent response by stake
    // const entries = [...responseMap.entries()];

    // // Check if entries array is empty
    // if (entries.length === 0) {
    //     throw new Error("No valid responses to aggregate");
    // }

    // // Use reduce with an initial value
    // const mostFrequentResponse = entries.reduce(
    //     (a, b) => (b[1] > a[1] ? b : a),
    //     [0, 0n] // Initial value: [key, BigInt(0)]
    // );

    // console.log("mostFrequentResponse", mostFrequentResponse);

    // // Check if the majority stake is reached
    // if (mostFrequentResponse[1] < totalStake / 2n) {
    //     throw new Error("Majority not reached");
    // }

    // return mostFrequentResponse[0].toString();
// }
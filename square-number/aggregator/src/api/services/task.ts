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


				await verifyContract.write.submitTaskResponse([taskRequest.task, taskResponse]);
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

// async function sendTaskVerifyToAllOperators(task: any): Promise<number> {
// 	let operatorResponses: VerifyResponse[] = await Promise.all(
// 		registeredOperators.map(async (operator) => {
// 			try {
// 				const response = await fetch(`${operator.url}/verify`, {
// 					method: "POST",
// 					body: JSON.stringify(task),
// 					headers: { "Content-Type": "application/json" },
// 				});
// 				const responseJson = await response.json();
// 				console.log("responseJson",responseJson);
// 				const serviceResponse: any = (responseJson as ServiceResponse<VerifyResponse>).responseObject;

// 				console.log("ServiceRes,",serviceResponse);
// 				return serviceResponse;
// 				// return {
// 				// 	completedTask: serviceResponse.completedTask,
// 				// 	publicKey: serviceResponse.publicKey,
// 				// 	signature: serviceResponse.signature,
// 				// } as TaskResponse;
// 			} catch (e) {
// 				logger.error(`Error in sendTaskVerifyToAllOperators: ${e}`);
// 				return undefined as unknown as VerifyResponse;
// 			}
// 		})
// 	);

// 	const validResponses = operatorResponses.filter((response): response is VerifyResponse => response !== undefined);

//   // Verify operator responses asynchronously
//   const verifiedResponses = await Promise.all(
//     validResponses.map(async (response) => {
//           console.log("single res",response);
//       const isVerified = await verifyMessage({
//         address: response.publicKey,
//         message: JSON.stringify(response.completedTask),
//         signature: response.signature,
//       });
//       return isVerified ? response : undefined; // Filter out non-verified responses
//     })
//   );

//   // Filter out non-verified responses
//   const filteredVerifiedResponses = verifiedResponses.filter((response): response is VerifyResponse => response !== undefined);

//   // Map to aggregate operator responses by transaction status
//   const responseMap: Map<string, number> = new Map();

//   // Aggregate responses by transaction status
// //   for (const operator of filteredVerifiedResponses) {
// //     const transactionStatus = operator.completedTask.transactionStatus; // Assuming you want to aggregate by transaction status
// //     const existingCount = responseMap.get(transactionStatus) || 0;
// //     responseMap.set(transactionStatus, existingCount + 1);
// //   }

//   // Determine the most frequent response by count
//   const mostFrequentResponse = [...responseMap.entries()].reduce((a, b) => (b[1] > a[1] ? b : a));

//   // Check if the majority stake is reached, if needed
//   const totalResponses = filteredVerifiedResponses.length;
//   if (mostFrequentResponse[1] < totalResponses / 2) {
//     throw new Error("Majority not reached");
//   }

// //   console.log("Most Frequent Response:", mostFrequentResponse);
//   return 0;
// }

async function sendTaskVerifyToAllOperators(task: Task): Promise<string> {
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
  
		  // Validate the response using Zod
		  const serviceResponse = TaskResponseSchema.parse(responseJson);
  
		  console.log("ServiceRes,", serviceResponse);
		  return serviceResponse;
		} catch (e) {
		  console.error(`Error in sendTaskVerifyToAllOperators: ${e}`);
		  return undefined as unknown as TaskResponse; // Ensure to return a compatible type
		}
	  })
	);
  
	// Filter out undefined responses
	const validResponses = operatorResponses.filter((response): response is TaskResponse => response !== undefined);
  
	// Verify operator responses asynchronously
	const verifiedResponses = await Promise.all(
	  validResponses.map(async (response) => {
		const isVerified = await verifyMessage({
		  address: response.publicKey as Address,
		  message: JSON.stringify(response.completedTask),
		  signature: response.signature as Hex,
		});
		return isVerified ? response : undefined; // Return verified responses
	  })
	);
  
	console.log("verifiedResponses ",verifiedResponses);
	// Filter out non-verified responses
	const filteredVerifiedResponses = verifiedResponses.filter((response): response is TaskResponse => response !== undefined);
   console.log("filered ",filteredVerifiedResponses);
	// Map to aggregate operator responses by transaction status
	const responseMap: Map<string, number> = new Map(); // Use string for transactionStatus keys

// Iterate through the filtered verified responses to aggregate based on transactionStatus
// for (const operator of filteredVerifiedResponses) {
//   const transactionStatus = operator.completedTask.transactionStatus; // Access transactionStatus correctly
//   const existingCount = responseMap.get(transactionStatus) || 0; // Get current count or 0
//   responseMap.set(transactionStatus, existingCount + 1); // Increment count for this status
// }

// 	// Determine the most frequent response by count
// 	const mostFrequentResponse = [...responseMap.entries()].reduce((a, b) => (b[1] > a[1] ? b : a));
  
// 	// Check if the majority stake is reached
// 	const totalResponses = filteredVerifiedResponses.length;
// 	if (mostFrequentResponse[1] < totalResponses / 2) {
// 	  throw new Error("Majority not reached");
// 	}
  
// 	console.log("Most Frequent Response:", mostFrequentResponse);
// 	return mostFrequentResponse[0]; // Return the most frequent transaction status
    return  "0"; 
  }
  
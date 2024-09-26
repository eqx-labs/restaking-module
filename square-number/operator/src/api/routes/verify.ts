import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Request, Response, Router } from "express";

import { handleTask } from "@/api/controllers/task";
import { createApiResponse } from "@/api/docs/openAPIResponseBuilders";
import { handleServiceResponse } from "@/api/handlers";
import { ServiceResponse } from "@/api/models";
import { Task, TaskResponseSchema, TaskRequest } from "@/api/models/Task";
import { VerifyResponseSchema } from "../../api/models/verify";
import verify_txn_controller from "../controllers/verify_txn"

export const verifyPath = "/verify";
export const verifyRegistry = new OpenAPIRegistry();
export const verifyRouter: Router = Router();

verifyRegistry.registerPath({
	method: "post",
	path: verifyPath,
	tags: ["verify"],
	request: { body: { content: { "application/json": { schema: {} } } } },
	responses: createApiResponse(VerifyResponseSchema, "Success"),
});

verifyRouter.post("/", async (req: Request, res: Response) => {
	try {
		const verify: any = req.body;
		console.log("verify operator", verify);
		const verifyResponse = await verify_txn_controller(verify.txnHash, verify.blockNumber);
		console.log("verifyResponse",verifyResponse);
		handleServiceResponse(ServiceResponse.success("verify completed successfully", verifyResponse), res);
	} catch (error) {
		handleServiceResponse(ServiceResponse.failure(`router :: POST :: /verify :: failed with error ${error}`, null), res);
	}
});

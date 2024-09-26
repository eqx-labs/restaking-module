import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);


export type Task = z.infer<typeof TaskSchema>;
export const TaskSchema = z.object({
	txhash: z.number(),
    blocknumber:z.number(),
});


export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;
export const VerifyResponseSchema = z.object({
	transactionStatus: z.string(),
    proposal: z.string().optional()
});


export type TaskResponse = z.infer<typeof TaskResponseSchema>;
export const TaskResponseSchema = z.object({
	completedTask: VerifyResponseSchema,
	publicKey: z.string(),
	signature: z.string(),
});

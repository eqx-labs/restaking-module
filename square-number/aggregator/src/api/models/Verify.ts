import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

// Define the schema for the Task
export const TaskSchema = z.object({
    txhash: z.number(),
    blocknumber: z.number(),
});

// Infer TypeScript type from TaskSchema
export type Task = z.infer<typeof TaskSchema>;

// Define the schema for the VerifyResponse
export const VerifyResponseSchema = z.object({
    transactionStatus: z.string(),
    proposal: z.string().optional(),
});

// Infer TypeScript type from VerifyResponseSchema
export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;

// Define the schema for the TaskResponse, which includes a completed task
export const TaskResponseSchema = z.object({
    completedTask: VerifyResponseSchema,
    publicKey: z.string(),
    signature: z.string(),
});

// Infer TypeScript type from TaskResponseSchema
export type TaskResponse = z.infer<typeof TaskResponseSchema>;

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;
export const VerifyResponseSchema = z.object({
	transactionStatus: z.string(),
    proposal: z.string().optional()
});

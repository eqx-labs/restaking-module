import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import * as packageJson from "package.json";

import { operatorRegistry } from "../routes/operator";
import { healthzRegistry } from "../routes/healthz";

export function generateOpenAPIDocument() {
	const registry = new OpenAPIRegistry([healthzRegistry, operatorRegistry]);
	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			version: packageJson.version,
			title: packageJson.name,
			description: packageJson.description,
		},
		externalDocs: {
			description: "View the raw OpenAPI Specification in JSON format",
			url: "/swagger.json",
		},
	});
}

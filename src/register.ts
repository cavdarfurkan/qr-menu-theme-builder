import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import fs from "fs";
import { SchemaOptions } from "./index.js";
import {
	ensureDirectoryExists,
	getSchemaFilePath,
	getSchemasDirectoryPath,
	clearSchemasDirectory
} from "./utils.js";

/**
 * Register schemas and immediately generate JSON schemas
 */
export const registerAndGenerateSchemas = (schemas: Record<string, { schema: z.ZodObject<any>; options: SchemaOptions }>) => {
	// Ensure schemas directory exists
	ensureDirectoryExists(getSchemasDirectoryPath());
	
	// Clear existing schema files
	clearSchemasDirectory();
	
	// Generate schemas for all registered schemas
	let generatedCount = 0;
	
	for (const [name, { schema, options }] of Object.entries(schemas)) {
		// Convert to JSON schema
		const jsonSchema = zodToJsonSchema(schema, { name });
		const schemaContent = JSON.stringify(jsonSchema);
		
		// Write schema to file
		const outputPath = getSchemaFilePath(name);
		fs.writeFileSync(outputPath, schemaContent, "utf8");
		console.log(`Generated JSON schema for '${name}' at ${outputPath}`);
		generatedCount++;
	}
	
	return {
		generated: generatedCount
	};
};

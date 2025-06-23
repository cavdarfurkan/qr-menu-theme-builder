import { z } from "zod";
import { registerAndGenerateSchemas } from "./register.js";

export interface SchemaOptions {
	name: string;
}

/**
 * Register schemas and generate JSON schema files
 * 
 * @param schemas A record of schema name to schema object
 * @returns Information about the generation process
 */
export const registerSchemas = (
	schemas: Record<string, z.ZodObject<any>>
): { generated: number } => {
	// Convert to the format expected by the register function
	const schemaEntries = Object.entries(schemas).map(([name, schema]) => {
		return [name, { schema, options: { name } }];
	});
	
	// Convert back to a record
	const schemaMap = Object.fromEntries(schemaEntries);
	
	// Register and generate schemas in one step
	return registerAndGenerateSchemas(schemaMap);
};

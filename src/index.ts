import { registerAndGenerateSchemas } from "./register.js";
import { SchemaType } from "../types/types.js";

/**
 * Register schemas and generate JSON schema files
 *
 * @param schemas A record of schema name to schema object
 * @returns Information about the generation process
 */
export const registerSchemas = (schemas: SchemaType[]) => {
	registerAndGenerateSchemas(schemas);
};

export type { SchemaType } from "../types/types.js";

import { generateSchemas, saveLoaderLocations } from "./register.js";
import type { SchemaType } from "../types/types.js";
import type { z } from "zod";

/**
 * Registers schemas and generates JSON schema files.
 *
 * @param schemas - An array of schema definitions to register and process.
 */
export const registerSchemas = (schemas: SchemaType<z.ZodTypeAny>[]) => {
	generateSchemas(schemas);
	saveLoaderLocations(schemas);
};

export type { SchemaType } from "../types/types.js";

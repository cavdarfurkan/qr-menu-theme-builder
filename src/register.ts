import { zodToJsonSchema } from "zod-to-json-schema";
import fs from "fs";
import path from "path";
import { SchemaType } from "../types/types.js";
import {
	ensureDirectoryExists,
	getSchemaFilePath,
	getSchemasDirectoryPath,
	clearSchemasDirectory,
} from "./utils.js";

/**
 * Register schemas and immediately generate JSON schemas
 */
export const registerAndGenerateSchemas = (schemas: SchemaType[]) => {
	ensureDirectoryExists(getSchemasDirectoryPath());
	clearSchemasDirectory();

	let generatedCount = 0;

	for (const schema of schemas) {
		const jsonSchema = JSON.stringify(
			zodToJsonSchema(schema.schema, schema.name)
		);

		const outputPath = getSchemaFilePath(schema.name);
		fs.writeFileSync(outputPath, jsonSchema, "utf8");
		console.log(
			`Generated JSON schema for '${schema.name}' at ${outputPath}`
		);
		generatedCount++;
	}

	saveLoaderLocations(schemas);

	return {
		generated: generatedCount,
	};
};

const saveLoaderLocations = (schemas: SchemaType[]) => {
	const outputPath = path.join(process.cwd(), ".loader_locations.json");

	const loaderLocations = schemas.reduce((acc: Record<string, string>, schema) => {
		acc[schema.name] = schema.loader_location;
		return acc;
	}, {});

	fs.writeFileSync(outputPath, JSON.stringify(loaderLocations));
};

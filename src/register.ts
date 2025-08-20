import fs from "fs";
import { SchemaType } from "../types/types.js";
import {
	getThemeSchemasPath,
	ensureLoaderFilesExist,
	getLoaderLocationsPath,
} from "./utils.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Register schemas and immediately generate JSON schemas
 */
export const registerAndGenerateSchemas = (schemas: SchemaType[]) => {
	const definitions = Object.fromEntries(
		schemas.map((s) => [s.name, s.schema])
	);

	const container = z.object(
		Object.fromEntries(schemas.map((s) => [s.name, s.schema]))
	);

	const jsonSchema = zodToJsonSchema(container, {
		$refStrategy: "root",
		definitions,
		name: "ThemeSchemas",
	});

	const outputPath = getThemeSchemasPath();
	fs.writeFileSync(outputPath, JSON.stringify(jsonSchema), "utf8");
	console.log(`Generated Theme schemas: ${outputPath}`);

	ensureLoaderFilesExist(schemas);
	saveLoaderLocations(schemas);
};

/**
 * Create .loader_location.json file.
 */
const saveLoaderLocations = (schemas: SchemaType[]) => {
	const outputPath = getLoaderLocationsPath();

	const loaderLocations = schemas.reduce(
		(acc: Record<string, string>, schema) => {
			acc[schema.name] = schema.loader_location;
			return acc;
		},
		{}
	);

	fs.writeFileSync(outputPath, JSON.stringify(loaderLocations));
	console.log(`Saved loader locations manifest: ${outputPath}`);
};

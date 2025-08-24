import fs from "fs";
import { SchemaType } from "../types/types.js";
import {
	ensureLoaderFilesExist,
	getLoaderLocationsPath,
	ensureDirectoryExists,
	getThemeSchemasDirectoryPath,
	clearThemeSchemasDirectory,
	getThemeSchemaFilePath,
	getThemeUiSchemaFilePath,
	getThemeUiSchemasDirectoryPath,
	clearThemeUiSchemasDirectory,
	removeLoaderFiles,
} from "./utils.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Generate JSON schemas for the given schemas and save them to the theme schemas file.
 */
export const generateSchemas = (schemas: SchemaType<z.ZodTypeAny>[]) => {
	ensureDirectoryExists(getThemeSchemasDirectoryPath());
	clearThemeSchemasDirectory();

	ensureDirectoryExists(getThemeUiSchemasDirectoryPath());
	clearThemeUiSchemasDirectory();

	schemas.forEach((schema) => {
		const jsonSchema = zodToJsonSchema(schema.schema, {
			name: schema.name,
			$refStrategy: "root",
		});

		const uiSchema = JSON.stringify(schema.uiSchema);

		const outputPath = getThemeSchemaFilePath(schema.name);
		fs.writeFileSync(outputPath, JSON.stringify(jsonSchema), "utf8");
		console.log(`Generated theme schema: ${outputPath}`);

		const uiOutputPath = getThemeUiSchemaFilePath(schema.name);
		fs.writeFileSync(uiOutputPath, uiSchema, "utf8");
		console.log(`Generated theme ui schema: ${uiOutputPath}`);
	});
};

/**
 * Create .loader_location.json file.
 */
export const saveLoaderLocations = (schemas: SchemaType<z.ZodTypeAny>[]) => {
	try {
		removeLoaderFiles();
		ensureLoaderFilesExist(schemas);
	} catch (error) {
		console.error(`Failed to prepare loader files: ${error}`);
		throw error;
	}

	const outputPath = getLoaderLocationsPath();

	const loaderLocations = schemas.reduce(
		(acc: Record<string, string>, schema) => {
			acc[schema.name] = schema.loaderLocation;
			return acc;
		},
		{}
	);

	fs.writeFileSync(outputPath, JSON.stringify(loaderLocations));
	console.log(`Saved loader locations manifest: ${outputPath}`);
};

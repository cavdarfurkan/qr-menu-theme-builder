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
		let jsonSchema = zodToJsonSchema(schema.schema, {
			name: schema.name,
			$refStrategy: "root",
		});

		// Make relation fields permissive based on uiSchema
		if (schema.uiSchema) {
			jsonSchema = makeRelationFieldsPermissive(jsonSchema, schema.uiSchema);
		}

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

function makeRelationFieldsPermissive(jsonSchema: any, uiSchema: any): any {
	const schemaName = jsonSchema.$ref?.replace("#/definitions/", "");
	if (!schemaName || !jsonSchema.definitions?.[schemaName]) {
		return jsonSchema;
	}

	const definition = jsonSchema.definitions[schemaName];
	if (!definition.properties) {
		return jsonSchema;
	}

	// Find relation fields from uiSchema
	for (const [fieldName, fieldUiSchema] of Object.entries(uiSchema)) {
		if ((fieldUiSchema as any)?.["ui:field"] === "relationSelect") {
			const isMultiple = (fieldUiSchema as any)?.["ui:options"]?.isMultiple;

			// Replace with permissive schema
			definition.properties[fieldName] = isMultiple
				? { type: "array" } // Accept any array
				: { type: "object" }; // Accept any object

			// Remove from required if present (relations are handled separately)
			if (definition.required) {
				definition.required = definition.required.filter(
					(req: string) => req !== fieldName
				);
			}
		}
	}

	return jsonSchema;
}

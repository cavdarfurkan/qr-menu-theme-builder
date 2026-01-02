import fs from "fs";
import path from "path";
import { SchemaType } from "../types/types.js";
import { z } from "zod";

const THEME_SCHEMAS_DIR = "schemas";
const THEME_UI_SCHEMAS_DIR = "ui_schemas";
const THEME_LOADER_LOCATIONS_FILE = ".loader_locations.json";

/**
 * Check if a file exists.
 */
export function isFileExists(filePath: string): boolean {
	return fs.existsSync(filePath);
}

/**
 * Ensure a directory exists
 */
export function ensureDirectoryExists(dirPath: string): void {
	fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Get the path for theme schemas directory.
 */
export function getThemeSchemasDirectoryPath(): string {
	return path.join(process.cwd(), THEME_SCHEMAS_DIR);
}

/**
 * Get the path for a specific schemas file.
 */
export function getThemeSchemaFilePath(schemaName: string): string {
	return path.join(getThemeSchemasDirectoryPath(), `${schemaName}.json`);
}

/**
 * Remove all existing files in the theme schemas directory.
 */
export function clearThemeSchemasDirectory(): void {
	const dirPath = getThemeSchemasDirectoryPath();

	if (!fs.existsSync(dirPath)) {
		return;
	}

	fs.readdirSync(dirPath).forEach((file) => {
		const filePath = path.join(dirPath, file);
		try {
			fs.unlinkSync(filePath);
		} catch (err) {
			console.error(`Failed to delete ${filePath}:`, err);
		}
	});
}

/**
 * Get the path for ui schemas directory.
 */
export function getThemeUiSchemasDirectoryPath(): string {
	return path.join(process.cwd(), THEME_UI_SCHEMAS_DIR);
}

/**
 * Get the path for a specific ui schemas file.
 */
export function getThemeUiSchemaFilePath(schemaName: string): string {
	return path.join(getThemeUiSchemasDirectoryPath(), `${schemaName}.ui.json`);
}

/**
 * Remove all existing files in the theme ui schemas directory.
 */
export function clearThemeUiSchemasDirectory(): void {
	const dirPath = getThemeUiSchemasDirectoryPath();

	if (!fs.existsSync(dirPath)) {
		return;
	}

	fs.readdirSync(dirPath).forEach((file) => {
		const filePath = path.join(dirPath, file);
		try {
			fs.unlinkSync(filePath);
		} catch (err) {
			console.error(`Failed to delete ${filePath}:`, err);
		}
	});
}

/**
 * Get the path for loader locations file.
 */
export function getLoaderLocationsPath(): string {
	return path.join(process.cwd(), THEME_LOADER_LOCATIONS_FILE);
}

/**
 * Validate loader file content against a schema.
 * @param content - The file content to validate
 * @param schema - The Zod schema to validate against
 * @param isJson - Whether the content is JSON format
 * @returns true if content is valid, false otherwise
 */
function isValidLoaderContent(
	content: string,
	schema: z.ZodTypeAny,
	isJson: boolean
): boolean {
	// Empty content is considered invalid
	if (!content || content.trim() === "") {
		return false;
	}

	try {
		let parsedContent: unknown;

		if (isJson) {
			// Parse JSON first
			parsedContent = JSON.parse(content);

			// For JSON files, loader files typically contain arrays of items
			// If content is an array, validate each item against the schema
			if (Array.isArray(parsedContent)) {
				// Validate each item in the array against the schema
				for (let i = 0; i < parsedContent.length; i++) {
					const item = parsedContent[i];
					const itemResult = schema.safeParse(item);
					if (!itemResult.success) {
						return false;
					}
				}
				return true;
			}
			// If not an array, validate the content directly (for backward compatibility)
		} else {
			// For non-JSON files, use raw content
			parsedContent = content;
		}

		// Validate against schema (for non-array content or non-JSON files)
		const result = schema.safeParse(parsedContent);
		return result.success;
	} catch (error) {
		// Any parse error or validation error means invalid content
		return false;
	}
}

/**
 * Ensure loader locations' directories and files exist
 */
export function ensureLoaderFilesExist(
	schemas: SchemaType<z.ZodTypeAny>[]
): void {
	for (const schema of schemas) {
		const location = schema.loaderLocation;
		if (!location) continue;

		const absolutePath = path.isAbsolute(location)
			? location
			: path.join(process.cwd(), location);
		const directoryPath = path.dirname(absolutePath);
		ensureDirectoryExists(directoryPath);

		const ext = path.extname(absolutePath).toLowerCase();
		const defaultContent = ext === ".json" ? "[]" : "";
		const isJson = ext === ".json";

		// Check if file already exists
		if (isFileExists(absolutePath)) {
			console.log("file exists");
			try {
				// Read existing content
				const existingContent = fs.readFileSync(absolutePath, "utf8");

				// Validate existing content against schema
				if (isValidLoaderContent(existingContent, schema.schema, isJson)) {
					console.log(
						`Preserved valid loader file for '${schema.name}': ${absolutePath}`
					);
					continue; // Skip writing, preserve existing content
				} else {
					// Content is invalid, overwrite with default
					console.warn(
						`Loader file for '${schema.name}' contains invalid content, overwriting with default: ${absolutePath}`
					);
				}
			} catch (error) {
				// Error reading file, treat as invalid and overwrite
				console.warn(
					`Error reading loader file for '${schema.name}', overwriting with default: ${absolutePath}`,
					error
				);
			}
		} else {
			console.log("file does not exists");
		}

		// File doesn't exist or has invalid content, create/overwrite with default
		fs.writeFileSync(absolutePath, defaultContent, "utf8");
		console.log(`Created loader file for '${schema.name}': ${absolutePath}`);
	}
}

/**
 * Remove loader files that are not in the new schema list.
 * This includes files from old locations and any other files in loader directories.
 */
export function removeLoaderFiles(schemas: SchemaType<z.ZodTypeAny>[]): void {
	const loaderLocationsPath = getLoaderLocationsPath();

	// Build a Set of new loader locations from the current schemas
	const newLocations = new Set<string>();
	const loaderDirectories = new Set<string>();
	for (const schema of schemas) {
		if (schema.loaderLocation) {
			const absolutePath = path.isAbsolute(schema.loaderLocation)
				? schema.loaderLocation
				: path.join(process.cwd(), schema.loaderLocation);
			newLocations.add(absolutePath);
			// Track directories that contain loader files
			const directoryPath = path.dirname(absolutePath);
			loaderDirectories.add(directoryPath);
		}
	}

	// Remove files from old .loader_locations.json if it exists
	if (fs.existsSync(loaderLocationsPath)) {
		try {
			const data = fs.readFileSync(loaderLocationsPath, "utf8");
			const oldLocations: Record<string, string> = JSON.parse(data);

			for (const location of Object.values(oldLocations)) {
				const absolutePath = path.isAbsolute(location)
					? location
					: path.join(process.cwd(), location);

				// Remove if this location is NOT in the new schemas
				if (!newLocations.has(absolutePath)) {
					if (fs.existsSync(absolutePath)) {
						fs.unlinkSync(absolutePath);
						console.log(`Removed unused loader file: ${absolutePath}`);
					}
				}
			}
		} catch (err) {
			console.error("Failed to remove unused loader files from old locations:", err);
		}

		// Remove the .loader_locations.json file itself (it will be recreated)
		try {
			fs.unlinkSync(loaderLocationsPath);
		} catch (err) {
			console.error("Failed to remove loader locations file:", err);
		}
	}

	// Scan loader directories and remove any files that aren't in the new schema list
	for (const directoryPath of loaderDirectories) {
		if (!fs.existsSync(directoryPath)) {
			continue;
		}

		try {
			const files = fs.readdirSync(directoryPath);
			for (const file of files) {
				const filePath = path.join(directoryPath, file);
				// Skip directories
				if (fs.statSync(filePath).isDirectory()) {
					continue;
				}
				// Skip if this file is in the new schema list
				if (newLocations.has(filePath)) {
					continue;
				}
				// Remove file that's not in the new schema list
				fs.unlinkSync(filePath);
				console.log(`Removed unused loader file: ${filePath}`);
			}
		} catch (err) {
			console.error(`Failed to scan directory ${directoryPath}:`, err);
		}
	}
}

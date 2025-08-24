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
		fs.writeFileSync(absolutePath, defaultContent, "utf8");
		console.log(`Created loader file for '${schema.name}': ${absolutePath}`);
	}
}

/**
 * Remove all loader files.
 */
export function removeLoaderFiles(): void {
	const loaderLocationsPath = getLoaderLocationsPath();
	if (!fs.existsSync(loaderLocationsPath)) {
		return;
	}

	try {
		const data = fs.readFileSync(loaderLocationsPath, "utf8");
		const locations: Record<string, string> = JSON.parse(data);

		for (const location of Object.values(locations)) {
			const absolutePath = path.isAbsolute(location)
				? location
				: path.join(process.cwd(), location);
			if (fs.existsSync(absolutePath)) {
				fs.unlinkSync(absolutePath);
			}
		}
	} catch (err) {
		console.error("Failed to remove loader files:", err);
	}

	// Remove the .loader_locations.json file itself
	try {
		fs.unlinkSync(loaderLocationsPath);
	} catch (err) {
		console.error("Failed to remove loader locations file:", err);
	}
}

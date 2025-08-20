import fs from "fs";
import path from "path";
import { SchemaType } from "../types/types.js";

/**
 * Check if a file exists.
 */
export function isFileExists(filePath: string): boolean {
	return fs.existsSync(filePath);
}

/**
 * Get the path for theme schemas file.
 */
export function getThemeSchemasPath(): string {
	return path.join(process.cwd(), ".theme_schemas.json");
}

/**
 * Get the path for loader locations file.
 */
export function getLoaderLocationsPath(): string {
	return path.join(process.cwd(), ".loader_locations.json");
}

/**
 * Ensure a directory exists
 */
export function ensureDirectoryExists(dirPath: string): void {
	fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Ensure loader locations' directories and files exist
 */
export function ensureLoaderFilesExist(schemas: SchemaType[]): void {
	for (const schema of schemas) {
		const location = schema.loader_location;
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

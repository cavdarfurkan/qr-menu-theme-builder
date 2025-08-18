import fs from "fs";
import path from "path";
import { SchemaType } from "../types/types.js";

/**
 * Ensure a directory exists
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Get the directory path for storing JSON schemas
 */
export function getSchemasDirectoryPath(): string {
  return path.join(process.cwd(), "schemas");
}

/**
 * Get the path for a specific schema file
 */
export function getSchemaFilePath(name: string): string {
  return path.join(getSchemasDirectoryPath(), `${name}.json`);
}

/**
 * Remove all existing schema files
 */
export function clearSchemasDirectory(): void {
  const schemasDir = getSchemasDirectoryPath();
  
  if (!fs.existsSync(schemasDir)) {
    return;
  }
  
  const files = fs.readdirSync(schemasDir);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      fs.unlinkSync(path.join(schemasDir, file));
    }
  }
} 

/**
 * Ensure loader locations' directories and files exist
 */
export function ensureLoaderLocationsExist(schemas: SchemaType[]): void {
  for (const schema of schemas) {
    const location = schema.loader_location;
    if (!location) continue;

    const absolutePath = path.isAbsolute(location)
      ? location
      : path.join(process.cwd(), location);
    const directoryPath = path.dirname(absolutePath);
    ensureDirectoryExists(directoryPath);

    if (!fs.existsSync(absolutePath)) {
      const ext = path.extname(absolutePath).toLowerCase();
      const defaultContent = ext === ".json" ? "[]" : "";
      fs.writeFileSync(absolutePath, defaultContent, "utf8");
      console.log(`Created loader file for '${schema.name}': ${absolutePath}`);
    }
  }
}
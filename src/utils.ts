import fs from "fs";
import path from "path";

/**
 * Ensure a directory exists
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
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
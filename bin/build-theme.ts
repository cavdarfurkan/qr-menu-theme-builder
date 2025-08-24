import chalk from "chalk";
import fs, { createWriteStream } from "fs";
import path from "path";
import archiver from "archiver";
import {
	getLoaderLocationsPath,
	getThemeSchemasDirectoryPath,
	getThemeUiSchemasDirectoryPath,
	isFileExists,
} from "../src/utils.js";
import {
	BuildThemeOptions,
	ContentType,
	ManifestType,
} from "../types/types.js";

// Get the current directory
const currentDir = process.cwd();

// Define a type for archiver errors
interface ArchiverError extends Error {
	code?: string;
}

const SCHEMA_EXTENSION = ".json";
const UI_SCHEMA_EXTENSION = ".ui.json";

export const buildTheme = async (options: BuildThemeOptions) => {
	try {
		console.log(chalk.blue("Building theme zip file..."));

		// Create output file stream
		const output = createWriteStream(path.join(currentDir, options.output));
		const archive = archiver("zip", {
			zlib: { level: 9 }, // Maximum compression
		});

		// Listen for all archive data to be written
		output.on("close", () => {
			console.log(chalk.green(`✓ Theme zip file created: ${options.output}`));
			console.log(
				chalk.green(
					`  Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`
				)
			);
		});

		// Handle warnings and errors
		archive.on("warning", (err: ArchiverError) => {
			if (err.code === "ENOENT") {
				console.warn(chalk.yellow(`Warning: ${err.message}`));
			} else {
				throw err;
			}
		});

		archive.on("error", (err: ArchiverError) => {
			throw err;
		});

		// Pipe archive data to the output file
		archive.pipe(output);

		const contentTypes: ContentType[] = [];

		// Check if the required files and directories exist
		if (!isFileExists(getLoaderLocationsPath())) {
			throw Error("'.loader_locations.json' file does not exist");
		}
		if (!isFileExists(getThemeSchemasDirectoryPath())) {
			throw Error("'schemas' directory does not exist");
		}
		if (!isFileExists(getThemeUiSchemasDirectoryPath())) {
			throw Error("'ui_schemas' directory does not exist");
		}

		// Get the loader locations from the .loader_locations.json file
		const loaderLocations: Record<string, string> = JSON.parse(
			fs.readFileSync(getLoaderLocationsPath(), "utf8")
		);

		// Get the schema files from the 'schemas' directory
		const schemaFiles = fs.readdirSync(getThemeSchemasDirectoryPath());
		for (const file of schemaFiles) {
			if (!file.endsWith(SCHEMA_EXTENSION)) {
				continue;
			}

			const schemasDir = path.basename(getThemeSchemasDirectoryPath());
			const uiSchemasDir = path.basename(getThemeUiSchemasDirectoryPath());

			const schemaName = file.replace(SCHEMA_EXTENSION, "");
			const schemaPath = `${schemasDir}/${file}`;

			// Check if there's a corresponding UI schema
			const uiSchemaPath = `${uiSchemasDir}/${schemaName}${UI_SCHEMA_EXTENSION}`;
			const absoluteUiSchemaPath = path.join(
				getThemeUiSchemasDirectoryPath(),
				`${schemaName}${UI_SCHEMA_EXTENSION}`
			);
			if (!fs.existsSync(absoluteUiSchemaPath)) {
				console.warn(
					chalk.yellow(
						`Warning: No UI schema found for content type '${schemaName}'`
					)
				);
				continue;
			}

			// Get the loader location for this content type
			const loaderLocation = loaderLocations[schemaName];
			if (!loaderLocation) {
				console.warn(
					chalk.yellow(
						`Warning: No loader location found for content type '${schemaName}'`
					)
				);
				continue;
			}

			// Add to contentTypes array
			contentTypes.push({
				name: schemaName,
				schemaPath: schemaPath,
				uiSchemaPath: uiSchemaPath,
				loaderLocationPath: loaderLocation,
			});

			console.log(chalk.blue(`  Added content type: ${schemaName}`));
		}

		// Create a manifest.json file
		const manifest: ManifestType = {
			name: options.name || path.basename(currentDir),
			version: options.version,
			description: options.description,
			author: options.author,
			createdAt: new Date().toISOString(),
			contentTypes: contentTypes,
		};

		// Add manifest file to the archive
		archive.append(JSON.stringify(manifest), {
			name: "manifest.json",
		});
		console.log(chalk.blue("  Added file: manifest.json"));

		// Add project files, excluding specific directories and files
		const excludePatterns = [
			"node_modules/**",
			"dist/**",
			".git/**",
			".gitignore",
			".vscode/**",
			"*.zip",
			".DS_Store",
			"*.log",
			"npm-debug.log*",
			"yarn-debug.log*",
			"yarn-error.log*",
			".env",
			".env.*",
			"coverage/**",
			".nyc_output/**",
			".astro/**",
		];

		// Add all files in the current directory, excluding the patterns above
		archive.glob("**/*", {
			cwd: currentDir,
			ignore: excludePatterns,
			dot: true,
		});

		console.log(
			chalk.blue("  Added project files (excluding development files/folders)")
		);

		// Finalize the archive
		await archive.finalize();
	} catch (error) {
		console.error(chalk.red("Error building theme zip:"), error);
		process.exit(1);
	}
};

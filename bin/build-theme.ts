import chalk from "chalk";
import fs, { createWriteStream } from "fs";
import path from "path";
import archiver from "archiver";
import { getLoaderLocationsPath, isFileExists } from "../src/utils.js";
import { BuildThemeOptions, SchemaLocation } from "../types/types.js";

// Get the current directory
const currentDir = process.cwd();

// Define a type for archiver errors
interface ArchiverError extends Error {
	code?: string;
}

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

		// Get the loader locations from the .loader_locations.json file
		if (!isFileExists(getLoaderLocationsPath()))
			throw Error("'.loader_locations.json' file does not exists");
		const loaderLocations: Record<string, string> = JSON.parse(
			fs.readFileSync(getLoaderLocationsPath(), "utf8")
		);

		const schemaLocations: SchemaLocation[] = [];
		for (const [key, val] of Object.entries(loaderLocations)) {
			schemaLocations.push({
				name: key,
				location: val,
			});
		}

		// Create a manifest.json file
		const manifest = {
			name: options.name || path.basename(currentDir),
			version: options.version,
			description: options.description,
			author: options.author,
			createdAt: new Date().toISOString(),
			loaderLocations: schemaLocations,
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
			"schemas/**",
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

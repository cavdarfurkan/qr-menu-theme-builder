import chalk from "chalk";
import fs from "fs";
import path from "path";
import { createWriteStream } from "fs";
import archiver from "archiver";
import { getSchemasDirectoryPath } from "../src/utils.js";
import { BuildThemeOptions } from "./types/types.js";

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
			console.log(
				chalk.green(`✓ Theme zip file created: ${options.output}`)
			);
			console.log(
				chalk.green(
					`  Total size: ${(archive.pointer() / 1024 / 1024).toFixed(
						2
					)} MB`
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

		// Check if schemas directory exists
		const schemasDir = getSchemasDirectoryPath();
		const schemaFiles: { name: string; path: string }[] = [];

		if (fs.existsSync(schemasDir)) {
			const files = fs.readdirSync(schemasDir);

			for (const file of files) {
				if (file.endsWith(".json")) {
					const filePath = path.join(schemasDir, file);
					schemaFiles.push({
						name: file.replace(/\.json$/, ""),
						path: filePath,
					});

					// Add schema file to the archive
					archive.file(filePath, { name: `schemas/${file}` });
					console.log(chalk.blue(`  Added schema: schemas/${file}`));
				}
			}
		} else {
			console.warn(
				chalk.yellow(
					"Warning: Schemas directory not found. No schemas will be included."
				)
			);
			// Create an empty schemas directory in the zip
			archive.append("", { name: "schemas/.gitkeep" });
		}

		// Create a manifest.json file
		const manifest = {
			name: options.name || path.basename(currentDir),
			version: options.version,
			description: options.description,
			author: options.author,
			createdAt: new Date().toISOString(),
			schemasLocation: schemaFiles.map((file) => ({
				name: file.name,
				path: `schemas/${file.name}.json`,
			})),
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
			chalk.blue(
				"  Added project files (excluding development files/folders)"
			)
		);

		// Finalize the archive
		await archive.finalize();
	} catch (error) {
		console.error(chalk.red("Error building theme zip:"), error);
		process.exit(1);
	}
};

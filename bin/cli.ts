#!/usr/bin/env node

import { Command } from "commander";
import { buildTheme } from "./build-theme.js";
import { BuildThemeOptions } from "../types/types.js";
import { input } from "@inquirer/prompts";
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";

const program = new Command();

program
	.command("build-theme")
	.description("Build a theme zip file with schemas and manifest")
	.option("-o, --output <file>", "Output zip file name")
	.option("-n, --name <name>", "Theme name for the manifest")
	.option("-v, --version <version>", "Theme version for the manifest")
	.option(
		"-d, --description <description>",
		"Theme description for the manifest"
	)
	.option("-a, --author <author>", "Theme author for the manifest")
	.action(async (options) => {
		if (!options.output) {
			options.output = await input({
				message: "Output zip file name",
				default: "theme.zip",
			});
			if (!options.output.endsWith(".zip")) {
				options.output += ".zip";
			}
		}

		if (!options.name) {
			const randomName: string = uniqueNamesGenerator({
				dictionaries: [adjectives, animals, colors],
				separator: '-',
				length: 2,
				style: 'lowerCase',
			});
			options.name = await input({ 
				message: "Theme name",
				default: randomName,
			});
			if (!options.name) {
				console.error("Theme name is required");
				process.exit(1);
			}
		}

		if (!options.version) {
			options.version = await input({
				message: "Theme version",
				default: "1.0.0",
			});
		}

		if (!options.description) {
			options.description = await input({ message: "Theme description" });
			if (!options.description) {
				console.error("Theme description is required");
				process.exit(1);
			}
		}

		if (!options.author) {
			options.author = await input({ message: "Theme author" });
			if (!options.author) {
				console.error("Theme author is required");
				process.exit(1);
			}
		}

		await buildTheme(options as BuildThemeOptions);
	});

program.parse(process.argv);

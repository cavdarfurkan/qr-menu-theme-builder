import { z } from "zod";

export interface BuildThemeOptions {
	output: string;
	name: string;
	version: string;
	description: string;
	author: string;
}

export interface SchemaType {
	name: string;
	schema: z.ZodTypeAny;
	loader_location: string;
}

export interface SchemaLocation {
	name: string;
	location: string;
}

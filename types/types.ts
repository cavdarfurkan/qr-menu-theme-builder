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
	schema: z.ZodObject<any>;
	loader_location: string;
}

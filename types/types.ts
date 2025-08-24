import type { UiSchema } from "@rjsf/utils";
import { z } from "zod";

export interface BuildThemeOptions {
	output: string;
	name: string;
	version: string;
	description: string;
	author: string;
}

export interface SchemaType<T extends z.ZodTypeAny> {
	name: string;
	schema: T;
	uiSchema?: { [K in keyof z.infer<T>]?: UiSchema } | UiSchema;
	loaderLocation: string;
}

export interface ContentType {
	name: string;
	schemaPath: string;
	uiSchemaPath: string;
	loaderLocationPath: string;
}

export interface ManifestType {
	name: string;
	version: string;
	description: string;
	author: string;
	createdAt: string;
	contentTypes: ContentType[];
}

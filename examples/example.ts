import { z } from "zod";
import { registerSchemas, SchemaType } from "../src/index.js";

// Define a schema for a category
const categorySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	description: z.string().optional(),
});

// Define a schema for a menu item
const menuItemSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(100),
	description: z.string().optional(),
	price: z.number().positive(),
	category: categorySchema,
	available: z.boolean().default(true),
	nutritionalInfo: z
		.object({
			calories: z.number().optional(),
			protein: z.number().optional(),
			carbs: z.number().optional(),
			fat: z.number().optional(),
		})
		.optional(),
});

// Define a schema type for the category schema
const categorySchemaType: SchemaType<typeof categorySchema> = {
	name: "category",
	schema: categorySchema,
	uiSchema: {
		"ui:order": ["id", "name", "description"],
		name: {
			"ui:widget": "text",
		},
		description: {
			"ui:widget": "textarea",
		},
	},
	loaderLocation: "data/categories.json",
};

// Define a schema type for the menu item schema
const menuItemSchemaType: SchemaType<typeof menuItemSchema> = {
	name: "menuItem",
	schema: menuItemSchema,
	uiSchema: {
		id: {
			"ui:widget": "hidden",
		},
		name: {
			"ui:widget": "text",
		},
		price: {
			"ui:widget": "number",
		},
		category: {
			"ui:widget": "relationSelect",
		},
		available: {
			"ui:widget": "checkbox",
		},
	},
	loaderLocation: "data/menu_items.json",
};

// Register schemas and generate JSON files in one step
registerSchemas([categorySchemaType, menuItemSchemaType]);

// To run this example:
// npx tsx example.ts

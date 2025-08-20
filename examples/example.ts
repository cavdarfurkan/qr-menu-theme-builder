import { z } from "zod";
import { registerSchemas } from "../src/index.js";

// Define a schema for a category
const categorySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	description: z.string().optional(),
	items: z.array(z.string().uuid()),
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

// Register schemas and generate JSON files in one step
registerSchemas([
	{
		name: "menuItem",
		schema: menuItemSchema,
		loader_location: "data/menu_items.json",
	},
	{
		name: "category",
		schema: categorySchema,
		loader_location: "data/categories.json",
	},
]);

// If you want to run this example with ts-node:
// npx tsx example.ts

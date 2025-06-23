import { z } from "zod";
import { registerSchemas } from "../src/index.js";

// Define a schema for a menu item
const menuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  categories: z.array(z.string()),
  available: z.boolean().default(true),
  nutritionalInfo: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional()
  }).optional()
});

// Define another schema for a category
const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  items: z.array(z.string().uuid())
});

// Register schemas and generate JSON files in one step
const result = registerSchemas({
  menuItem: menuItemSchema,
  category: categorySchema
});

console.log(`Generated ${result.generated} schemas`);

// If you want to run this example with ts-node:
// npx ts-node --esm examples/basic-usage.ts 
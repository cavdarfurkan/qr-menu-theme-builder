import { z } from "zod";
import { registerSchemas } from "../src/index.js";

// Define schemas
const menuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  categories: z.array(z.string()),
  available: z.boolean().default(true)
});

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

// To run this example:
// npx ts-node --esm examples/simple-usage.ts 
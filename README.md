# QR Menu Theme Builder

A library for registering Zod schemas as themes and converting them to JSON schemas.

## Installation

```bash
npm install qr-menu-theme-builder
```

## Features

- Register Zod schemas for automatic conversion to JSON schemas
- Simple one-step API for schema registration and JSON generation
- Automatically handles schema file generation
- CLI tool for packaging themes as distributable zip files

## Usage

Register your Zod schemas and generate JSON schemas in one step:

```typescript
import { z } from "zod";
import { registerSchemas } from "qr-menu-theme-builder";

// Define your Zod schemas
const menuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  categories: z.array(z.string()),
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

const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  items: z.array(z.string().uuid()),
});

// Register schemas and generate JSON files in one step
const result = registerSchemas([
  {
    name: "menuItem",
    schema: menuItemSchema,
    loader_location: "examples/data/menu_items.json",
  },
  {
    name: "category",
    schema: categorySchema,
    loader_location: "examples/data/categories.json",
  },
]);

console.log(`Generated ${result.generated} schemas`);
```

To run this example:

```bash
npx tsx examples/example.ts
```

The generated schemas will be saved to a `schemas` directory in your project root.

## Building Theme Packages

Once you've defined your schemas, you can use the CLI to build a distributable theme package:

```bash
npx qr-menu-theme-builder build-theme --name "My Restaurant Theme" --author "Your Name" --description "A theme for restaurant menus"
```

This creates a zip file containing your project files, schemas, and a manifest.json file with metadata.

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <file>` | Output zip file name | `theme.zip` |
| `-n, --name <name>` | Theme name for the manifest | Directory name |
| `-v, --version <version>` | Theme version | `1.0.0` |
| `-d, --description <description>` | Theme description | `""` |
| `-a, --author <author>` | Theme author | `""` |

### Theme Package Structure

The generated theme package includes:

- All project files (excluding development files like `node_modules`, `.git`, etc.)
- A `schemas` directory containing all the JSON schemas
- A `manifest.json` file with metadata about the theme and schemas

## How It Works

The `registerSchemas` function:

1. Takes a record of named Zod schemas
2. Converts each schema to a JSON schema
3. Clears the schemas directory to remove any old schemas
4. Writes the new schema files to the schemas directory

This simplifies the process to a single function call, making it easy to integrate into your build or development process.

## License

ISC

## Author

Furkan Çavdar

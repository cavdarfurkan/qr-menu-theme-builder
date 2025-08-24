# QR Menu Theme Builder

[![npm version](https://img.shields.io/npm/v/qr-menu-theme-builder.svg)](https://www.npmjs.com/package/qr-menu-theme-builder)

A library for registering Zod schemas as themes and converting them into per-schema JSON Schema files.

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

Register your Zod schemas and generate a JSON schema in one step:

```typescript
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
```

To run this example:

```bash
npx tsx examples/example.ts
```

The generated schemas and ui schemas will be saved to `schemas/` and `ui_schemas/` directories respectively.

## Building Theme Packages

Once you've defined your schemas, you can use the CLI to build a distributable theme package:

```bash
npx qr-menu-theme-builder build-theme --name "My Restaurant Theme" --author "Your Name" --description "A theme for restaurant menus"
```

This creates a zip file containing your project files, .theme_schemas.json, .loader_locations.json, and a manifest.json file with metadata.

### CLI Options

| Option                            | Description                 | Default        |
| --------------------------------- | --------------------------- | -------------- |
| `-o, --output <file>`             | Output zip file name        | `theme.zip`    |
| `-n, --name <name>`               | Theme name                  | randomly generated |
| `-v, --version <version>`         | Theme version               | `1.0.0`        |
| `-d, --description <description>` | Theme description           | `""`           |
| `-a, --author <author>`           | Theme author                | `""`           |

### Theme Package Structure

The generated theme package includes:

- All project files (excluding development files like `node_modules`, `.git`, etc.)
- A `schemas/` directory containing per-schema JSON Schema files
- A `ui_schemas/` directory containing per-schema UI schema files
- A `.loader_locations.json` file indicating content locations
- A `manifest.json` file with theme metadata and a `contentTypes[]` array referencing each schema, UI schema, and loader location

## How It Works

The `registerSchemas` function:

1. Takes a record of named Zod schemas
2. Converts each schema to a JSON schema
3. Writes the new schema file to `.theme_schemas.json` file
4. Creates empty content files at their respective locations

This simplifies the process to a single function call, making it easy to integrate into your build or development process.

## License

ISC

## Author

Furkan Çavdar

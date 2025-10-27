# @ht-rnd/bpmn-dmn-react-ui

A modern React component library for embedding BPMN and DMN viewers and editors in your applications. Built with [bpmn-js](https://github.com/bpmn-io/bpmn-js) and [dmn-js](https://github.com/bpmn-io/dmn-js), featuring full Tailwind CSS styling support and flexible theming.

## Features

- **BPMN & DMN Support** - High-performance viewers and full-featured interactive editors
- **ViewMode Toggle** - Seamless switching between editor and XML source views
- **Theme Support** - Built-in dark/light themes with customizable styling
- **Complete Integration** - shadcn/ui components, Tailwind CSS, and TypeScript support

## Installation

```bash
npm install @ht-rnd/bpmn-dmn-react-ui
```

## Setup

1. Configure Tailwind CSS to include the library components:

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // ...your existing content paths
    "node_modules/@ht-rnd/bpmn-dmn-react-ui/**/*.{js,jsx,ts,tsx}",
  ],
  // ...rest of your config
};
```

2. Import the required styles in your application entry point:

```tsx
import "@ht-rnd/bpmn-dmn-react-ui/styles.css";
```

## Theming and Customization

This library is built on the `shadcn/ui` theming architecture, which relies on CSS variables for colors, borders, spacing, and radius. You can easily override these variables in your own project to match your application's design system.

1. In your project's global CSS file (e.g., `src/index.css`), define your custom theme variables inside a `@layer base` block.
2. Your definitions will automatically override the library's default theme.

When you pass the `theme="dark"` prop to the BpmnProvider and DmnProvider, it will apply a `.dark` class to its root element, causing the browser to use the variables defined in your `.dark { ... }` block.

### Example `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 329 100% 44%;
    --primary-hover: 329 100% 38%;
    --primary-pressed: 329 100% 31%;
    --primary-foreground: 0 0% 100%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 3.8% 80%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 100% 50%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 240 5.9% 10%;
    --foreground: 0 0% 92%;
    --primary: 330 96% 35%;
    --primary-hover: 330 96% 41%;
    --primary-pressed: 330 96% 48%;
    --primary-foreground: 240 17.1% 92%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 92%;
    --muted: 240 3.8% 40%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 92%;
    --destructive: 0 100% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 30%;
    --input: 240 3.7% 30%;<>
  }
}
```

## Quick Start

### BPMN Example

```tsx
import { BpmnProvider, BpmnEditor, BpmnToolbar } from "@ht-rnd/bpmn-dmn-react-ui";

function BpmnExample() {
  const editorRef = useRef(null);
  return (
    <BpmnProvider theme="dark">
      <div className="flex flex-col gap-4">
        <BpmnToolbar
          config={{
            download: {
              label: "Download",
              variant: "default",
            },
            toggle: { hidden: true },
          }}
        />
        <div className="h-[600px]">
          <BpmnEditor
            ref={editorRef}
            initialXML={yourBpmnXml}
            onXMLChange={(xml) => {
              console.log("BPMN updated:", xml);
            }}
          />
        </div>
      </div>
    </BpmnProvider>
  );
}
```

### DMN Example

```tsx
import { DmnProvider, DmnEditor, DmnToolbar } from "@ht-rnd/bpmn-dmn-react-ui";

function DmnExample() {
  const editorRef = useRef(null);
  return (
    <DmnProvider>
      <div className="flex flex-col gap-4">
        <DmnToolbar />
        <div className="h-[600px]">
          <DmnEditor
            ref={editorRef}
            initialXML={yourDmnXml}
            onXMLChange={(xml) => {
              console.log("DMN updated:", xml);
            }}
          />
        </div>
      </div>
    </DmnProvider>
  );
}
```

## API Reference

### Providers

Both BPMN and DMN components require their respective provider wrappers for proper context management:

```tsx
interface IProviderProps {
  theme?: "light" | "dark"; // Default: "light"
  children: React.ReactNode;
}
```

### Viewers & Editors

```tsx
interface IViewerProps {
  xml?: string;
}

interface IEditorProps {
  initialXML?: string;
  onXMLChange?: (xml: string) => void;
}

interface IEditorRef {
  getXML: () => Promise<string>;
  setXML: (xml: string) => Promise<void>;
}
```

### Toolbars

```tsx
interface IToolbar {
  config?: {
    new?: IToolbarButton; // New diagram
    load?: IToolbarButton; // Load diagram
    download?: IToolbarButton; // Download diagram
    toggle?: IToolbarButton; // Toggle view
  };
  className?: string;
  orientation?: "horizontal" | "vertical";
  spacing?: "sm" | "md" | "lg";
}

interface IToolbarButton {
  hidden?: boolean;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}
```

## Compatibility

- Frameworks: React 18+, Next.js, Vite
- Styling: Tailwind CSS 3+, shadcn/ui
- Language: Full TypeScript support
- Standards: BPMN 2.0, DMN 1.3

## License

Licensed under the Apache License 2.0

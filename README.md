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

## Styling & Theming

The library uses Tailwind CSS and shadcn/ui components for consistent, accessible UI patterns. All components accept className props for additional customization and support all shadcn/ui button variants.

## Compatibility

- Frameworks: React 18+, Next.js, Vite
- Styling: Tailwind CSS 3+, shadcn/ui
- Language: Full TypeScript support
- Standards: BPMN 2.0, DMN 1.3

## License

Licensed under the Apache License 2.0

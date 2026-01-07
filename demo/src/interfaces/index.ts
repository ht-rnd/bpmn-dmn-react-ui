export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

export interface ButtonConfig {
  hidden: boolean;
  label: string;
  variant: ButtonVariant;
  className: string;
}

export interface ComponentConfig {
  mode: "editor" | "viewer";
  toolbarPosition: "top" | "bottom";
  toolbarSide: "left" | "right";
  toolbarOrientation: "horizontal" | "vertical";
  toolbarSpacing: "sm" | "md" | "lg";
  newButton: ButtonConfig;
  loadButton: ButtonConfig;
  saveButton: ButtonConfig;
  downloadButton: ButtonConfig;
  toggleButton: ButtonConfig;
}

export interface SampleDiagram {
  id: string;
  name: string;
  description: string;
  xml: string;
}

export interface AppContextType {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  bpmnConfig: ComponentConfig;
  setBpmnConfig: (config: ComponentConfig) => void;
  dmnConfig: ComponentConfig;
  setDmnConfig: (config: ComponentConfig) => void;
}

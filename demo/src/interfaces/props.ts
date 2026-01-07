import type { ButtonConfig, ComponentConfig, SampleDiagram } from ".";

export interface IHeaderProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}
export interface IButtonConfigItemProps {
  buttonName: string;
  displayName: string;
  button: ButtonConfig;
  onUpdate: (updates: Partial<ButtonConfig>) => void;
}

export interface IPropsPanelProps {
  config: ComponentConfig;
  onConfigChange: (config: ComponentConfig) => void;
}

export interface ISampleDiagramsProps {
  samples: SampleDiagram[];
  onSelect: (xml: string) => void;
  title?: string;
}
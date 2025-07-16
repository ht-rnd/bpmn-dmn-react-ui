export interface IProviderProps {
  theme?: "light" | "dark";
  children: React.ReactNode;
}

export interface IEditorRef {
  getXML: () => Promise<string>;
  setXML: (xml: string) => Promise<void>;
}

export interface IEditorProps {
  initialXML?: string;
  onXMLChange?: (xml: string) => void;
}

export interface IToolbarButton {
  hidden?: boolean;
  label?: string;
  variant?: "secondary" | "link" | "default" | "destructive" | "outline" | "ghost";
  className?: string;
}

export interface IToolbar {
  new?: IToolbarButton;
  load?: IToolbarButton;
  download?: IToolbarButton;
  toggle?: IToolbarButton;
  className?: string;
  orientation?: "horizontal" | "vertical";
  spacing?: "sm" | "md" | "lg";
}

export interface IContextValue {
  editorRef: React.MutableRefObject<IEditorRef | null>;
  handleNewDiagram: () => Promise<void>;
  handleLoadDiagram: (xml: string) => Promise<void>;
  handleDownloadDiagram: () => Promise<void>;
  handleToggleView: () => void;
  isEditorView: boolean;
  setIsEditorView: (view: boolean) => void;
}

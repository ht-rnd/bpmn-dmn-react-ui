export interface IProviderProps {
  theme?: "light" | "dark";
  children: React.ReactNode;
  toolbarPosition?: "top" | "bottom";
}

export interface IEditorRef {
  getXML: (isUpload?: boolean, isSave?: boolean) => Promise<string>;
  setXML: (xml: string, isUpload?: boolean, isSave?: boolean) => Promise<void>;
}

export interface IEditorProps {
  initialXML?: string;
  onXMLChange?: (xml: string) => void;
  onSave?: (xml: string) => void | Promise<void>;
  onUpload?: (xml: string) => void | Promise<void>;
}

export interface IToolbarButton {
  hidden?: boolean;
  label?: string;
  variant?:
    | "secondary"
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "ghost";
  className?: string;
}

export interface IToolbar {
  new?: IToolbarButton;
  load?: IToolbarButton;
  save?: IToolbarButton;
  download?: IToolbarButton;
  toggle?: IToolbarButton;
  className?: string;
  orientation?: "horizontal" | "vertical";
  spacing?: "sm" | "md" | "lg";
  side?: "left" | "right";
}

export interface IContextValue {
  editorRef: React.MutableRefObject<IEditorRef | null>;
  handleNewDiagram: () => Promise<void>;
  handleLoadDiagram: (xml: string) => Promise<void>;
  handleDownloadDiagram: () => Promise<void>;
  handleSaveDiagram: () => Promise<void>;
  handleToggleView: () => void;
  isEditorView: boolean;
  setIsEditorView: (view: boolean) => void;
  position?: "top" | "bottom";
}

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { IContextValue, IEditorRef, IProviderProps } from "../../interfaces/BpmnDmn";
import { emptyDMN } from "../../services/dmn-provider.mock";

const DmnContext = createContext<IContextValue | null>(null);

export const useDmnContext = (): IContextValue => {
  const context = useContext(DmnContext);
  if (!context) {
    throw new Error("DmnToolbar and DmnEditor must be wrapped in DmnnProvider");
  }
  return context;
};

export const DmnProvider = ({ theme, children }: IProviderProps) => {
  const editorRef = useRef<IEditorRef>(null);
  const [isEditorView, setIsEditorView] = useState(true);

  const handleNewDiagram = useCallback(async () => {
    if (!editorRef.current) return;
    await editorRef.current.setXML(emptyDMN);
  }, []);

  const handleLoadDiagram = useCallback(async (xml: string) => {
    if (!editorRef.current) return;
    await editorRef.current.setXML(xml);
  }, []);

  const handleDownloadDiagram = useCallback(async () => {
    if (!editorRef.current) return;

    const xml = await editorRef.current.getXML();
    const blob = new Blob([xml], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "diagram.dmn";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  const handleToggleView = useCallback(() => {
    setIsEditorView((prev) => !prev);
  }, []);

  const value: IContextValue = {
    editorRef,
    handleNewDiagram,
    handleLoadDiagram,
    handleDownloadDiagram,
    handleToggleView,
    isEditorView,
    setIsEditorView,
  };

  return (
    <DmnContext.Provider value={value}>
      <div className={`${theme} w-full h-full max-w-full max-h-full overflow-hidden flex flex-col`}>{children}</div>
    </DmnContext.Provider>
  );
};

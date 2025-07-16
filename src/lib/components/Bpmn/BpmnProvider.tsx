import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { IContextValue, IEditorRef, IProviderProps } from "../../types";

const BpmnContext = createContext<IContextValue | null>(null);

export const useBpmnContext = (): IContextValue => {
  const context = useContext(BpmnContext);
  if (!context) {
    throw new Error("BpmnToolbar and BpmnEditor must be wrapped in BpmnProvider");
  }
  return context;
};

export const BpmnProvider = ({ theme, children }: IProviderProps) => {
  const editorRef = useRef<IEditorRef>(null);
  const [isEditorView, setIsEditorView] = useState(true);

  const handleNewDiagram = useCallback(async () => {
    if (!editorRef.current) return;
    await editorRef.current.setXML("");
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
    link.download = "diagram.bpmn";
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
    <BpmnContext.Provider value={value}>
      <div className={theme}>{children}</div>
    </BpmnContext.Provider>
  );
};

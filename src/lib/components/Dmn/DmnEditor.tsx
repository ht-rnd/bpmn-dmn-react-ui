import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import "../../styles.css";
import DmnModeler from "dmn-js/lib/Modeler";
import type { IEditorProps, IEditorRef } from "../../interfaces/BpmnDmn";
import { emptyDMN } from "../../services/dmn-provider.mock";
import { useDmnContext } from "./DmnProvider";

export const DmnEditor = forwardRef<IEditorRef, IEditorProps>(({ initialXML = "", onXMLChange }, ref) => {
  const { editorRef, isEditorView } = useDmnContext();
  const [currentXML, setCurrentXML] = useState<string>(initialXML);
  const containerRef = useRef<HTMLDivElement>(null);
  const dmnRef = useRef<InstanceType<typeof DmnModeler> | null>(null);

  useImperativeHandle(ref, () => ({
    setXML: async (xml: string) => {
      if (!dmnRef.current) return;
      if (xml) {
        await dmnRef.current.importXML(xml);
      } else {
        await dmnRef.current.importXML(emptyDMN);
      }
      const activeViewer = dmnRef.current.getActiveViewer();
      if (activeViewer) {
        const canvas = activeViewer.get("canvas");
        canvas.zoom("fit-viewport", "auto");
      }
      setCurrentXML(xml || emptyDMN);
      if (onXMLChange) {
        onXMLChange(xml || emptyDMN);
      }
    },
    getXML: async () => {
      if (!dmnRef.current) return "";
      const result = (await dmnRef.current.saveXML({
        format: true,
      })) as { xml: string };
      return result.xml;
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const dmn = new DmnModeler({
      container: containerRef.current,
    });
    dmnRef.current = dmn;

    const registerEventListeners = () => {
      const activeViewer = dmn.getActiveViewer();
      if (activeViewer) {
        const eventBus = activeViewer.get("eventBus");
        eventBus.on("commandStack.changed", async () => {
          const result = (await dmn.saveXML({
            format: true,
          })) as { xml: string };
          if (result.xml) {
            setCurrentXML(result.xml);
            if (onXMLChange) {
              onXMLChange(result.xml);
            }
          }
        });
      }
    };

    const initializeDiagram = async () => {
      if (currentXML) {
        await dmn.importXML(currentXML);
      } else {
        await dmn.importXML(emptyDMN);
        setCurrentXML(emptyDMN);
      }

      registerEventListeners();
      const activeViewer = dmn.getActiveViewer();
      if (activeViewer) {
        const canvas = activeViewer.get("canvas");
        canvas.zoom("fit-viewport", "auto");
      }
    };

    initializeDiagram();

    return () => {
      dmn.destroy();
    };
  }, [currentXML, onXMLChange, isEditorView]);

  useEffect(() => {
    if (ref && typeof ref === "object" && "current" in ref) editorRef.current = ref.current;
  }, [editorRef, ref]);

  if (!isEditorView) {
    return (
      <div className="bg-background text-foreground h-full border border-input rounded-md overflow-x-auto overflow-y-auto">
        <pre className="bg-background text-foreground whitespace-pre-wrap break-words">{currentXML}</pre>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex h-full w-full max-w-full max-h-full">
      <div
        ref={containerRef}
        className="bg-background text-foreground grow border border-input rounded-md overflow-hidden relative w-full h-full max-w-full max-h-full p-2"
      />
    </div>
  );
});

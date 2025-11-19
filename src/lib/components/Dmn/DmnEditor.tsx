import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "../../styles.css";
import DmnModeler from "dmn-js/lib/Modeler";
import type { IEditorProps, IEditorRef } from "../../interfaces/BpmnDmn";
import { emptyDMN } from "../../services/dmn-provider.mock";
import { useDmnContext } from "./DmnProvider";

export const DmnEditor = forwardRef<IEditorRef, IEditorProps>(
  ({ initialXML = "", onXMLChange, onSave, onUpload }, ref) => {
    const { editorRef, isEditorView } = useDmnContext();
    const [currentXML, setCurrentXML] = useState<string>(initialXML);
    const containerRef = useRef<HTMLDivElement>(null);
    const dmnRef = useRef<InstanceType<typeof DmnModeler> | null>(null);

    useImperativeHandle(ref, () => ({
      setXML: async (xml: string, isUpload = false) => {
        if (!dmnRef.current) return;
        const xmlToImport = xml || emptyDMN;
        await dmnRef.current.importXML(xmlToImport);
        const activeViewer = dmnRef.current.getActiveViewer();
        if (activeViewer) {
          const canvas = activeViewer.get("canvas");
          canvas.zoom("fit-viewport", "auto");
        }
        setCurrentXML(xmlToImport);
        if (onXMLChange) {
          onXMLChange(xmlToImport);
        }
        if (isUpload && onUpload) {
          await onUpload(xmlToImport);
        }
      },
      getXML: async (isSave = false) => {
        if (!dmnRef.current) return "";
        const result = (await dmnRef.current.saveXML({
          format: true,
        })) as { xml: string };
        if (isSave && onSave) {
          await onSave(result.xml);
        }
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
        const xmlToImport = currentXML || emptyDMN;
        await dmn.importXML(xmlToImport);
        if (!currentXML) {
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
      if (ref && typeof ref === "object" && "current" in ref)
        editorRef.current = ref.current;
    }, [editorRef, ref]);

    if (!isEditorView) {
      return (
        <div className="bg-background text-foreground h-full border border-input rounded-md overflow-x-auto overflow-y-auto">
          <pre className="bg-background text-foreground whitespace-pre-wrap break-words">
            {currentXML}
          </pre>
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
  }
);

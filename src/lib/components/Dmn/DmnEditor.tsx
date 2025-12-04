import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "../../styles.css";
import DmnModeler from "dmn-js/lib/Modeler";
import {
  DmnPropertiesPanelModule,
  DmnPropertiesProviderModule,
} from "dmn-js-properties-panel";
import "@bpmn-io/properties-panel/dist/assets/properties-panel.css";
import type { IEditorProps, IEditorRef } from "../../interfaces/BpmnDmn";
import { emptyDMN } from "../../services/dmn-provider.mock";
import { useDmnContext } from "./DmnProvider";

export const DmnEditor = forwardRef<IEditorRef, IEditorProps>(
  ({ initialXML = "", onXMLChange, onSave, onUpload }, ref) => {
    const { editorRef, isEditorView } = useDmnContext();
    const [currentXML, setCurrentXML] = useState<string>(initialXML);
    const containerRef = useRef<HTMLDivElement>(null);
    const propertiesPanelRef = useRef<HTMLDivElement>(null);
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
      if (!containerRef.current || !propertiesPanelRef.current) return;

      const dmn = new DmnModeler({
        container: containerRef.current,
        drd: {
          propertiesPanel: {
            parent: propertiesPanelRef.current,
          },
          additionalModules: [
            DmnPropertiesPanelModule,
            DmnPropertiesProviderModule,
          ],
        },
        decisionTable: {
          propertiesPanel: {
            parent: propertiesPanelRef.current,
          },
          additionalModules: [
            DmnPropertiesPanelModule,
            DmnPropertiesProviderModule,
          ],
        },
        literalExpression: {
          propertiesPanel: {
            parent: propertiesPanelRef.current,
          },
          additionalModules: [
            DmnPropertiesPanelModule,
            DmnPropertiesProviderModule,
          ],
        },
      });
      dmnRef.current = dmn;

      const hideInactivePropertyContainers = () => {
        if (!propertiesPanelRef.current) return;
        const containers =
          propertiesPanelRef.current.querySelectorAll<HTMLElement>(
            ".bio-properties-panel-container"
          );
        containers.forEach((container, index) => {
          if (index === containers.length - 1) {
            container.style.display = "block";
          } else {
            container.style.display = "none";
          }
        });
      };

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
          eventBus.on("selection.changed", () => {
            setTimeout(hideInactivePropertyContainers, 50);
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

      dmn.on("views.changed", ({ activeView }: any) => {
        if (activeView && activeView.element) {
          registerEventListeners();
          const activeViewer = dmn.getActiveViewer();
          if (activeViewer) {
            const canvas = activeViewer.get("canvas");
            canvas.zoom("fit-viewport", "auto");
          }
        }
      });

      const observer = new MutationObserver(() => {
        hideInactivePropertyContainers();
      });

      if (propertiesPanelRef.current) {
        observer.observe(propertiesPanelRef.current, {
          childList: true,
          subtree: false,
        });
      }

      return () => {
        observer.disconnect();
        dmn.destroy();
      };
    }, [isEditorView]);

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
      <div className="bg-background text-foreground flex gap-2 w-full h-full">
        <div
          ref={containerRef}
          className="bg-background text-foreground border border-input rounded-md grow p-2"
        />
        <div
          ref={propertiesPanelRef}
          className="bg-background text-foreground border border-input rounded-md w-64"
        />
      </div>
    );
  }
);

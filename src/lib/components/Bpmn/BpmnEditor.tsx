import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Code2, Workflow } from "lucide-react";
import type { IEditorProps, IEditorRef } from "../../types";
import { useBpmnContext } from "./BpmnProvider";
import "../../styles.css";

import lintModule from "bpmn-js-bpmnlint";
import BpmnColorPickerModule from "bpmn-js-color-picker";
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
} from "bpmn-js-properties-panel";
import Modeler from "bpmn-js/lib/Modeler";
import camundaCloudBehaviors from "camunda-bpmn-js-behaviors/lib/camunda-cloud";
import minimapModule from "diagram-js-minimap";
import zeebeModdle from "zeebe-bpmn-moddle/resources/zeebe";
/// <reference path="../../assets/bpmnlint-config.d.ts" />
import bpmnlintConfig from "../../assets/bpmnlint-config";

export const BpmnEditor = forwardRef<IEditorRef, IEditorProps>(
  ({ initialXML = "", onXMLChange, onSave, onUpload }, ref) => {
    const [currentXML, setCurrentXML] = useState<string>(initialXML);
    const { editorRef, isEditorView, handleToggleView } = useBpmnContext();
    const containerRef = useRef<HTMLDivElement>(null);
    const propertiesPanelRef = useRef<HTMLDivElement>(null);
    const bpmnRef = useRef<Modeler | null>(null);

    useEffect(() => {
      if (ref && typeof ref === "object" && "current" in ref)
        editorRef.current = ref.current;
    }, [editorRef, ref]);

    useImperativeHandle(ref, () => ({
      setXML: async (xml: string, isUpload = false) => {
        if (!bpmnRef.current) return;
        if (xml) {
          await bpmnRef.current.importXML(xml);
        } else {
          await bpmnRef.current.createDiagram();
        }
        const canvas = bpmnRef.current.get("canvas") as any;
        canvas.zoom("fit-viewport", "auto");
        setCurrentXML(xml);
        if (onXMLChange) {
          onXMLChange(xml);
        }
        if (isUpload && onUpload) {
          await onUpload(xml);
        }
      },
      getXML: async (isSave = false) => {
        if (!bpmnRef.current) return "";
        const result = (await bpmnRef.current.saveXML({
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

      const bpmn = new Modeler({
        container: containerRef.current,
        propertiesPanel: {
          parent: propertiesPanelRef.current,
        },
        additionalModules: [
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          camundaCloudBehaviors,
          minimapModule,
          BpmnColorPickerModule,
          lintModule,
          ZeebePropertiesProviderModule,
        ],
        linting: {
          bpmnlint: bpmnlintConfig,
          active: true,
        },
        moddleExtensions: {
          zeebe: zeebeModdle,
        },
      });
      bpmnRef.current = bpmn;

      // Set the layout config directly on the renderer before root.added fires.
      // BpmnPropertiesPanelRenderer reads _layoutConfig in _render() and passes
      // it as a prop, so PropertiesPanel's useState initializes with General open.
      (bpmn.get("propertiesPanel") as any)._layoutConfig = {
        groups: { general: { open: true } },
      };

      const initializeDiagram = async () => {
        if (currentXML) {
          await bpmn.importXML(currentXML);
        } else {
          await bpmn.createDiagram();
          const result = (await bpmn.saveXML({ format: true })) as {
            xml: string;
          };
          setCurrentXML(result.xml);
        }

        const canvas = bpmn.get("canvas") as any;
        canvas.zoom("fit-viewport", "auto");
      };

      initializeDiagram();

      const tagAnnotations = () => {
        const elementRegistry = bpmn.get("elementRegistry") as any;
        elementRegistry.forEach((element: any) => {
          if (element.type === "bpmn:TextAnnotation") {
            elementRegistry.getGraphics(element)?.classList.add("bpmn-text-annotation");
          }
        });
      };
      bpmn.on("import.done", tagAnnotations);
      bpmn.on("shape.added", ({ element }: any) => {
        if (element.type === "bpmn:TextAnnotation") {
          const gfx = (bpmn.get("elementRegistry") as any).getGraphics(element);
          gfx?.classList.add("bpmn-text-annotation");
        }
      });

      bpmn.on("commandStack.changed", async () => {
        const result = (await bpmn.saveXML({
          format: true,
        })) as { xml: string };
        if (result.xml) {
          setCurrentXML(result.xml);
          if (onXMLChange) {
            onXMLChange(result.xml);
          }
        }
      });

      return () => {
        bpmn.destroy();
      };
    }, [isEditorView]);

    const viewToggle = (
      <button
        onClick={handleToggleView}
        title={isEditorView ? "View XML" : "View Diagram"}
        className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-background/80 border border-border/50 backdrop-blur-sm"
      >
        {isEditorView ? <Code2 size={12} /> : <Workflow size={12} />}
        <span>{isEditorView ? "XML" : "Diagram"}</span>
      </button>
    );

    if (!isEditorView) {
      return (
        <div className="relative bg-background text-foreground h-full border border-input rounded-md overflow-x-auto overflow-y-auto">
          <pre className="bg-background text-foreground whitespace-pre-wrap break-words">
            {currentXML}
          </pre>
          {viewToggle}
        </div>
      );
    }

    return (
      <div className="bg-background text-foreground flex gap-2 w-full h-full">
        <div className="relative grow border border-input rounded-md overflow-hidden">
          <div
            ref={containerRef}
            className="bg-background text-foreground w-full h-full"
          />
          {viewToggle}
        </div>
        <div
          ref={propertiesPanelRef}
          className="bg-background text-foreground border border-input rounded-md w-64 overflow-hidden"
        />
      </div>
    );
  }
);

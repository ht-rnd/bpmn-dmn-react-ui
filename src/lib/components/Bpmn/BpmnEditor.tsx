import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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
    const { editorRef, isEditorView } = useBpmnContext();
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
    }, [currentXML, onXMLChange, isEditorView]);

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
          className="bg-background text-foreground border border-input rounded-md grow"
        />
        <div
          ref={propertiesPanelRef}
          className="bg-background text-foreground border border-input rounded-md max-w-[400px]"
        />
      </div>
    );
  }
);

import { useEffect, useRef } from "react";
import { emptyBPMN } from "../../services/bpmn-provider.mock";

import type Viewer from "bpmn-js";
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
} from "bpmn-js-properties-panel";
import BpmnNavigatedViewer from "bpmn-js/dist/bpmn-navigated-viewer.development.js";
import Modeler from "bpmn-js/lib/Modeler";
import camundaCloudBehaviors from "camunda-bpmn-js-behaviors/lib/camunda-cloud";
import type ElementRegistry from "diagram-js/lib/core/ElementRegistry";
import type EventBus from "diagram-js/lib/core/EventBus";
import zeebeModdle from "zeebe-bpmn-moddle/resources/zeebe";

export const BpmnViewer = ({ xml = emptyBPMN }) => {
  const containerRef = useRef(null);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const modelerRef = useRef<Modeler | null>(null);

  useEffect(() => {
    if (!containerRef.current || !propertiesPanelRef.current) return;

    const bpmnViewer = new BpmnNavigatedViewer({
      container: containerRef.current,
    });
    viewerRef.current = bpmnViewer;

    const bpmnModeler = new Modeler({
      propertiesPanel: {
        parent: propertiesPanelRef.current,
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        ZeebePropertiesProviderModule,
        camundaCloudBehaviors,
      ],
      moddleExtensions: {
        zeebe: zeebeModdle,
      },
    });
    modelerRef.current = bpmnModeler;

    const disableEditing = () => {
      if (!propertiesPanelRef.current) return;

      const inputs = propertiesPanelRef.current.querySelectorAll(
        "input, textarea, select"
      );
      const buttons = propertiesPanelRef.current.querySelectorAll(
        ".bio-properties-panel-remove-entry, .bio-properties-panel-open-feel-popup, .bio-properties-panel-add-entry, .bio-properties-panel-feel-icon"
      );
      const editors = propertiesPanelRef.current.querySelectorAll(".cm-editor");

      for (const input of inputs) {
        input.setAttribute("disabled", "true");
      }

      for (const button of buttons) {
        button.remove();
      }

      for (const editor of editors) {
        if (editor.childNodes[1] && editor.parentNode) {
          const child1 = editor.childNodes[1];
          const child2 = child1.firstChild;
          const child3 = child2?.firstChild;
          const child4 = child3?.firstChild;
          if (child4) {
            editor.parentNode.insertBefore(child4, editor);
          }
        }
        editor.remove();
      }
    };

    if (xml) {
      bpmnViewer
        .importXML(xml)
        .then(() => {
          (bpmnViewer.get("canvas") as any).zoom("fit-viewport", "auto");
        })
        .catch((err: any) => {
          console.error("Error importing XML into Viewer:", err);
        });
      bpmnModeler
        .importXML(xml)
        .then(() => {
          (bpmnModeler.get("canvas") as any).zoom("fit-viewport", "auto");
        })
        .catch((err) => {
          console.error("Error importing XML into Modeler:", err);
        });
    }

    const eventBus = bpmnViewer.get("eventBus") as EventBus;
    eventBus.on("element.click", (event: { element: { id: string } }) => {
      const element = event.element;
      const elementRegistry = bpmnModeler.get(
        "elementRegistry"
      ) as ElementRegistry;
      const modelerElement = elementRegistry.get(element.id);
      if (modelerElement) {
        const selection = bpmnModeler.get("selection") as {
          select: (element: any) => void;
        };
        selection.select(modelerElement);
      }
    });

    const observer = new MutationObserver(() => {
      disableEditing();
    });
    observer.observe(propertiesPanelRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      bpmnViewer.destroy();
      bpmnModeler.destroy();
    };
  }, [xml]);

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
};

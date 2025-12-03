import { useEffect, useRef } from "react";
import { emptyDMN } from "../../services/dmn-provider.mock";

import {
  DmnPropertiesPanelModule,
  DmnPropertiesProviderModule,
} from "dmn-js-properties-panel";
import DmnModeler from "dmn-js/lib/Modeler";
import "dmn-js/dist/assets/diagram-js.css";
import "dmn-js/dist/assets/dmn-font/css/dmn-embedded.css";
import "dmn-js/dist/assets/dmn-js-decision-table-controls.css";
import "dmn-js/dist/assets/dmn-js-decision-table.css";
import "dmn-js/dist/assets/dmn-js-drd.css";
import "dmn-js/dist/assets/dmn-js-literal-expression.css";
import "dmn-js/dist/assets/dmn-js-shared.css";

export const DmnViewer = ({ xml = emptyDMN }) => {
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dmnRef = useRef<InstanceType<typeof DmnModeler> | null>(null);
  if (!xml) xml = emptyDMN;

  useEffect(() => {
    if (!containerRef.current || !propertiesPanelRef.current) return;

    const dmnModeler = new DmnModeler({
      container: containerRef.current,
      keyboard: {
        bindTo: document,
      },
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
    dmnRef.current = dmnModeler;

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

    const disableCanvasEditing = (viewer: any) => {
      const modeling = viewer.get("modeling", false);
      if (modeling) {
        const commandStack = viewer.get("commandStack");
        commandStack.execute = () => {};
      }

      const contextPad = viewer.get("contextPad", false);
      if (contextPad) {
        contextPad.close();
        contextPad.open = () => {};
      }

      const palette = viewer.get("palette", false);
      if (palette) {
        palette.close();
        palette.open = () => {};
      }

      const directEditing = viewer.get("directEditing", false);
      if (directEditing) {
        directEditing.activate = () => {};
      }

      if (containerRef.current) {
        const canvasContainer =
          containerRef.current.querySelector<HTMLElement>(".djs-container");
        const defContainer =
          containerRef.current.querySelector<HTMLElement>(".dmn-definitions");
        const palleteContainer =
          containerRef.current.querySelector<HTMLElement>(".djs-palette");
        if (canvasContainer) {
          canvasContainer.style.pointerEvents = "auto";
          canvasContainer.style.cursor = "default";
        }
        if (defContainer) defContainer.style.display = "none";
        if (palleteContainer) palleteContainer.style.display = "none";
      }
    };

    const disablePropertiesPanel = () => {
      if (!propertiesPanelRef.current) return;

      const inputs = propertiesPanelRef.current.querySelectorAll<HTMLElement>(
        "input, textarea, select"
      );
      const buttons = propertiesPanelRef.current.querySelectorAll<HTMLElement>(
        ".bio-properties-panel-remove-entry, .bio-properties-panel-open-feel-popup, .bio-properties-panel-add-entry, .bio-properties-panel-feel-icon"
      );
      const editors =
        propertiesPanelRef.current.querySelectorAll<HTMLElement>(".cm-editor");

      for (const input of inputs) {
        input.setAttribute("disabled", "true");
        input.style.pointerEvents = "none";
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

      hideInactivePropertyContainers();
    };

    if (xml) {
      dmnModeler
        .importXML(xml)
        .then(() => {
          const activeViewer = dmnModeler.getActiveViewer();
          if (activeViewer) {
            const canvas = activeViewer.get("canvas");
            canvas.zoom("fit-viewport", "auto");
            disableCanvasEditing(activeViewer);
          }
          disablePropertiesPanel();
        })
        .catch((err: Error) => {
          console.error("Error importing XML into Viewer:", err);
        });
    }

    dmnModeler.on("views.changed", ({ activeView }: any) => {
      if (activeView && activeView.element) {
        const activeViewer = dmnModeler.getActiveViewer();
        if (activeViewer) {
          disableCanvasEditing(activeViewer);
          disablePropertiesPanel();
        }
      }
    });

    const observer = new MutationObserver(() => {
      disablePropertiesPanel();
    });
    observer.observe(propertiesPanelRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      dmnModeler.destroy();
    };
  }, [xml]);

  return (
    <div className="bg-background text-foreground flex gap-2 w-full h-full">
      <div
        ref={containerRef}
        className="bg-background text-foreground border border-input rounded-md grow p-2"
      />
      <div
        ref={propertiesPanelRef}
        className="bg-background text-foreground border border-input rounded-md w-64 overflow-y-auto"
      />
    </div>
  );
};

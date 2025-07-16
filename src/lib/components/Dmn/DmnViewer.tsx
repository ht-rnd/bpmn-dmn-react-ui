import { useEffect, useRef } from "react";
import { emptyDMN } from "../../services/dmn-provider.mock";

import DmnNavigatedViewer from "dmn-js/dist/dmn-navigated-viewer.development.js";
import "dmn-js/dist/assets/diagram-js.css";
import "dmn-js/dist/assets/dmn-font/css/dmn-embedded.css";
import "dmn-js/dist/assets/dmn-js-decision-table-controls.css";
import "dmn-js/dist/assets/dmn-js-decision-table.css";
import "dmn-js/dist/assets/dmn-js-drd.css";
import "dmn-js/dist/assets/dmn-js-literal-expression.css";
import "dmn-js/dist/assets/dmn-js-shared.css";

export const DmnViewer = ({ xml }: { xml: string }) => {
  const containerRef = useRef(null);
  const dmnRef = useRef(null);
  if (!xml) xml = emptyDMN;

  useEffect(() => {
    if (!containerRef.current) return;

    const dmnViewer = new DmnNavigatedViewer({
      container: containerRef.current,
    });
    dmnRef.current = dmnViewer;

    if (dmnRef.current && xml) {
      dmnViewer
        .importXML(xml)
        .then(() => {
          const canvas = dmnViewer.getActiveViewer().get("canvas");
          canvas.zoom("fit-viewport", "auto");
        })
        .catch((err: Error) => {
          console.error("Error importing XML into Viewer:", err);
        });
    }

    return () => {
      dmnViewer.destroy();
    };
  }, [xml]);

  return (
    <div ref={containerRef} className="bg-background text-foreground border border-input rounded-md w-full h-full" />
  );
};

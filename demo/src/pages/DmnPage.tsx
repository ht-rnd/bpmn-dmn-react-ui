import { useRef, useState } from "react";
import {
  DmnEditor,
  DmnProvider,
  DmnToolbar,
  DmnViewer,
  // @ts-ignore: no type declarations for '@ht-rnd/bpmn-dmn-react-ui'
} from "@ht-rnd/bpmn-dmn-react-ui";
import type { IDmnPageProps } from "../interfaces/props";
import { SampleDiagrams } from "../components/SampleDiagrams";
import { PropsPanel } from "../components/PropsPanel";
import { sampleDmnXmls } from "../data/sampleXmls";

export function DmnPage({ theme, config, onConfigChange }: IDmnPageProps) {
  const dmnEditorRef = useRef<any>(null);
  const [xml, setXml] = useState<string | undefined>(undefined);

  const handleXmlSelect = async (selectedXml: string) => {
    setXml(selectedXml);
    if (dmnEditorRef.current?.setXML) {
      try {
        await dmnEditorRef.current.setXML(selectedXml);
      } catch (error) {
        console.error("Error loading DMN:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 px-16">
      <DmnProvider theme={theme} toolbarPosition={config.toolbarPosition}>
        {config.mode === "editor" && (
          <>
            <DmnToolbar
              config={{
                new: {
                  hidden: config.newButton.hidden,
                  label: config.newButton.label,
                  variant: config.newButton.variant,
                  className: config.newButton.className,
                },
                load: {
                  hidden: config.loadButton.hidden,
                  label: config.loadButton.label,
                  variant: config.loadButton.variant,
                  className: config.loadButton.className,
                },
                save: {
                  hidden: config.saveButton.hidden,
                  label: config.saveButton.label,
                  variant: config.saveButton.variant,
                  className: config.saveButton.className,
                },
                download: {
                  hidden: config.downloadButton.hidden,
                  label: config.downloadButton.label,
                  variant: config.downloadButton.variant,
                  className: config.downloadButton.className,
                },
                toggle: {
                  hidden: config.toggleButton.hidden,
                  label: config.toggleButton.label,
                  variant: config.toggleButton.variant,
                  className: config.toggleButton.className,
                },
                side: config.toolbarSide,
                orientation: config.toolbarOrientation,
                spacing: config.toolbarSpacing,
              }}
            />

            <div className="h-[600px] rounded-lg overflow-hidden">
              <DmnEditor
                ref={dmnEditorRef}
                onXMLChange={(newXml: string) => {
                  setXml(newXml);
                }}
                onSave={(newXml: string) => {
                  console.log("DMN saved:", newXml);
                }}
              />
            </div>
          </>
        )}

        {config.mode === "viewer" && (
          <div className="h-[600px] rounded-lg overflow-hidden">
            <DmnViewer xml={xml} />
          </div>
        )}
      </DmnProvider>

      <div className="mt-8 flex flex-col gap-8">
        <PropsPanel config={config} onConfigChange={onConfigChange} />
        <SampleDiagrams
          samples={sampleDmnXmls}
          onSelect={handleXmlSelect}
          title="DMN Samples"
        />
      </div>
    </div>
  );
}

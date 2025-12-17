import { useRef, useState, useEffect } from "react";
import {
  BpmnEditor,
  BpmnProvider,
  BpmnToolbar,
  BpmnViewer,
  // @ts-ignore: no type declarations for '@ht-rnd/bpmn-dmn-react-ui'
} from "@ht-rnd/bpmn-dmn-react-ui";
import type { IBpmnPageProps } from "../interfaces/props";
import { SampleDiagrams } from "../components/SampleDiagrams";
import { PropsPanel } from "../components/PropsPanel";
import { sampleBpmnXmls } from "../data/sampleXmls";

export function BpmnPage({ theme, config, onConfigChange }: IBpmnPageProps) {
  const bpmnEditorRef = useRef<any>(null);
  const [xml, setXml] = useState<string | undefined>(undefined);

  const handleXmlSelect = async (selectedXml: string) => {
    setXml(selectedXml);
    if (bpmnEditorRef.current?.setXML) {
      try {
        await bpmnEditorRef.current.setXML(selectedXml);
      } catch (error) {
        console.error("Error loading BPMN:", error);
      }
    }
  };

  useEffect(() => {
    if (xml && bpmnEditorRef.current?.setXML) {
      bpmnEditorRef.current.setXML(xml).catch((error: any) => {
        console.error("Error loading BPMN:", error);
      });
    }
  }, [xml]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 px-16">
      <BpmnProvider theme={theme} toolbarPosition={config.toolbarPosition}>
        {config.mode === "editor" && (
          <>
            <BpmnToolbar
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
              <BpmnEditor
                ref={bpmnEditorRef}
                onXMLChange={(newXml: string) => {
                  setXml(newXml);
                }}
                onSave={(newXml: string) => {
                  console.log("BPMN saved:", newXml);
                }}
              />
            </div>
          </>
        )}

        {config.mode === "viewer" && (
          <div className="h-[600px] rounded-lg overflow-hidden">
            <BpmnViewer xml={xml} />
          </div>
        )}
      </BpmnProvider>

      <div className="flex flex-col gap-8 mt-8">
        <PropsPanel config={config} onConfigChange={onConfigChange} />
        <SampleDiagrams
          samples={sampleBpmnXmls}
          onSelect={handleXmlSelect}
          title="BPMN Samples"
        />
      </div>
    </div>
  );
}

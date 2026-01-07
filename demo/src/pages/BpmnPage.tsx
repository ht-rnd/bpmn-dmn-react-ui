import { useRef, useState } from "react";
import {
  BpmnEditor,
  BpmnProvider,
  BpmnToolbar,
  BpmnViewer,
  // @ts-ignore: no type declarations for '@ht-rnd/bpmn-dmn-react-ui'
} from "@ht-rnd/bpmn-dmn-react-ui";
import { useAppContext } from "../contexts/AppContext";
import { SampleDiagrams } from "../components/SampleDiagrams";
import { PropsPanel } from "../components/PropsPanel";
import { sampleBpmnXmls } from "../data/sampleXmls";

export function BpmnPage() {
  const { theme, bpmnConfig, setBpmnConfig } = useAppContext();
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

  return (
    <div className="min-h-screen bg-background text-foreground p-4 px-16">
      <BpmnProvider theme={theme} toolbarPosition={bpmnConfig.toolbarPosition}>
        {bpmnConfig.mode === "editor" && (
          <>
            <BpmnToolbar
              config={{
                new: {
                  hidden: bpmnConfig.newButton.hidden,
                  label: bpmnConfig.newButton.label,
                  variant: bpmnConfig.newButton.variant,
                  className: bpmnConfig.newButton.className,
                },
                load: {
                  hidden: bpmnConfig.loadButton.hidden,
                  label: bpmnConfig.loadButton.label,
                  variant: bpmnConfig.loadButton.variant,
                  className: bpmnConfig.loadButton.className,
                },
                save: {
                  hidden: bpmnConfig.saveButton.hidden,
                  label: bpmnConfig.saveButton.label,
                  variant: bpmnConfig.saveButton.variant,
                  className: bpmnConfig.saveButton.className,
                },
                download: {
                  hidden: bpmnConfig.downloadButton.hidden,
                  label: bpmnConfig.downloadButton.label,
                  variant: bpmnConfig.downloadButton.variant,
                  className: bpmnConfig.downloadButton.className,
                },
                toggle: {
                  hidden: bpmnConfig.toggleButton.hidden,
                  label: bpmnConfig.toggleButton.label,
                  variant: bpmnConfig.toggleButton.variant,
                  className: bpmnConfig.toggleButton.className,
                },
                side: bpmnConfig.toolbarSide,
                orientation: bpmnConfig.toolbarOrientation,
                spacing: bpmnConfig.toolbarSpacing,
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

        {bpmnConfig.mode === "viewer" && (
          <div className="h-[600px] rounded-lg overflow-hidden">
            <BpmnViewer xml={xml} />
          </div>
        )}
      </BpmnProvider>

      <div className="flex flex-col gap-8 mt-8">
        <PropsPanel config={bpmnConfig} onConfigChange={setBpmnConfig} />
        <SampleDiagrams
          samples={sampleBpmnXmls}
          onSelect={handleXmlSelect}
          title="BPMN Samples"
        />
      </div>
    </div>
  );
}

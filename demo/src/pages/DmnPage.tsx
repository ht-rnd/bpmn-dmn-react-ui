import { useRef, useState } from "react";
import {
  DmnEditor,
  DmnProvider,
  DmnToolbar,
  DmnViewer,
  // @ts-ignore: no type declarations for '@ht-rnd/bpmn-dmn-react-ui'
} from "@ht-rnd/bpmn-dmn-react-ui";
import { useAppContext } from "../contexts/AppContext";
import { SampleDiagrams } from "../components/SampleDiagrams";
import { PropsPanel } from "../components/PropsPanel";
import { sampleDmnXmls } from "../data/sampleXmls";

export function DmnPage() {
  const { theme, dmnConfig, setDmnConfig } = useAppContext();
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
      <DmnProvider theme={theme} toolbarPosition={dmnConfig.toolbarPosition}>
        {dmnConfig.mode === "editor" && (
          <>
            <DmnToolbar
              config={{
                new: {
                  hidden: dmnConfig.newButton.hidden,
                  label: dmnConfig.newButton.label,
                  variant: dmnConfig.newButton.variant,
                  className: dmnConfig.newButton.className,
                },
                load: {
                  hidden: dmnConfig.loadButton.hidden,
                  label: dmnConfig.loadButton.label,
                  variant: dmnConfig.loadButton.variant,
                  className: dmnConfig.loadButton.className,
                },
                save: {
                  hidden: dmnConfig.saveButton.hidden,
                  label: dmnConfig.saveButton.label,
                  variant: dmnConfig.saveButton.variant,
                  className: dmnConfig.saveButton.className,
                },
                download: {
                  hidden: dmnConfig.downloadButton.hidden,
                  label: dmnConfig.downloadButton.label,
                  variant: dmnConfig.downloadButton.variant,
                  className: dmnConfig.downloadButton.className,
                },
                toggle: {
                  hidden: dmnConfig.toggleButton.hidden,
                  label: dmnConfig.toggleButton.label,
                  variant: dmnConfig.toggleButton.variant,
                  className: dmnConfig.toggleButton.className,
                },
                side: dmnConfig.toolbarSide,
                orientation: dmnConfig.toolbarOrientation,
                spacing: dmnConfig.toolbarSpacing,
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

        {dmnConfig.mode === "viewer" && (
          <div className="h-[600px] rounded-lg overflow-hidden">
            <DmnViewer xml={xml} />
          </div>
        )}
      </DmnProvider>

      <div className="mt-8 flex flex-col gap-8">
        <PropsPanel config={dmnConfig} onConfigChange={setDmnConfig} />
        <SampleDiagrams
          samples={sampleDmnXmls}
          onSelect={handleXmlSelect}
          title="DMN Samples"
        />
      </div>
    </div>
  );
}

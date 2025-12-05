import { useRef } from "react";
import {
  BpmnEditor,
  BpmnProvider,
  BpmnToolbar,
  DmnEditor,
  DmnProvider,
  DmnToolbar,
} from "@ht-rnd/bpmn-dmn-react-ui";

export const App: React.FC = () => {
  const editorRef = useRef(null);
  const editorRef2 = useRef(null);

  return (
    <div className="m-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4">BPMN Editor Demo</h1>
      <BpmnProvider toolbarPosition="bottom">
        <BpmnToolbar
          config={{
            load: {
              variant: "default",
            },
            download: { hidden: true },
            new: { hidden: true },
            toggle: { hidden: true },
            side: "right",
          }}
        />
        <div className="h-[600px]">
          <BpmnEditor
            ref={editorRef}
            onXMLChange={(_xml: string) => {
              //console.log("BPMN updated:", _xml);
            }}
            onUpload={(_xml: string) => {
              //console.log("BPMN uploaded:", _xml);
            }}
            onSave={(_xml: string) => {
              //console.log("BPMN saved:", _xml);
            }}
          />
        </div>
      </BpmnProvider>

      <h1 className="text-2xl font-bold mb-4 mt-8">DMN Editor Demo</h1>
      <DmnProvider>
        <DmnToolbar
          config={{
            load: {
              variant: "default",
            },
            download: { hidden: true },
            new: { hidden: true },
            toggle: { hidden: true },
          }}
        />
        <div className="h-[600px]">
          <DmnEditor
            ref={editorRef2}
            onXMLChange={(_xml: string) => {
              //console.log("DMN updated:", _xml);
            }}
            onUpload={(_xml: string) => {
              //console.log("DMN uploaded:", _xml);
            }}
            onSave={(_xml: string) => {
              //console.log("DMN saved:", _xml);
            }}
          />
        </div>
      </DmnProvider>
    </div>
  );
};

import { useRef } from "react";
import {
  BpmnEditor,
  BpmnProvider,
  BpmnToolbar,
  BpmnViewer,
  DmnEditor,
  DmnProvider,
  DmnToolbar,
  DmnViewer,
} from "./lib";

export const App: React.FC = () => {
  const editorRef = useRef(null);
  const editorRef2 = useRef(null);

  return (
    <div className="m-4 flex flex-col gap-4">
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
            onXMLChange={(xml) => {
              //console.log("BPMN updated:", xml);
            }}
            onUpload={(xml) => {
              //console.log("BPMN uploaded:", xml);
            }}
            onSave={(xml) => {
              //console.log("BPMN saved:", xml);
            }}
          />
        </div>
      </BpmnProvider>
      <BpmnViewer />

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
            onXMLChange={(xml) => {
              //console.log("DMN updated:", xml);
            }}
            onUpload={(xml) => {
              //console.log("DMN uploaded:", xml);
            }}
            onSave={(xml) => {
              //console.log("DMN saved:", xml);
            }}
          />
        </div>
      </DmnProvider>
      <DmnViewer />
    </div>
  );
};

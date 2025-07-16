import { useRef } from "react";
import { orientation, spacing } from "../../consts/Toolbar";
import type { IToolbar, IToolbarButton } from "../../interfaces/BpmnDmn";
import { Button } from "../ui/button";
import { useDmnContext } from "./DmnProvider";

export const DmnToolbar = ({ config = {} }: { config?: IToolbar }) => {
  const { handleNewDiagram, handleLoadDiagram, handleDownloadDiagram, handleToggleView } = useDmnContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const xml = e.target?.result;
      if (typeof xml === "string") {
        handleLoadDiagram(xml);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  const handleButtonClick = (buttonId: string) => {
    switch (buttonId) {
      case "new":
        handleNewDiagram();
        break;
      case "load":
        fileInputRef.current?.click();
        break;
      case "download":
        handleDownloadDiagram();
        break;
      case "toggle":
        handleToggleView();
        break;
    }
  };

  const buttons = [
    { id: "new", defaultLabel: "New DMN" },
    { id: "load", defaultLabel: "Load DMN" },
    { id: "download", defaultLabel: "Download DMN" },
    { id: "toggle", defaultLabel: "Toggle View" },
  ];

  return (
    <div
      className={`flex mb-2 ${orientation[config.orientation || "horizontal"]} ${spacing[config.spacing || "md"]} ${
        config.className || ""
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".dmn,.xml"
        onChange={handleFileSelect}
      />

      {buttons
        .filter((button) => {
          const buttonConfig = config[button.id as keyof IToolbar];
          return !(typeof buttonConfig === "object" && buttonConfig?.hidden);
        })
        .map((button) => {
          const buttonConfig = (config[button.id as keyof IToolbar] as IToolbarButton) || {};

          return (
            <Button
              key={button.id}
              variant={buttonConfig.variant || "secondary"}
              onClick={() => handleButtonClick(button.id)}
              className={buttonConfig.className}
            >
              {buttonConfig.label || button.defaultLabel}
            </Button>
          );
        })}
    </div>
  );
};

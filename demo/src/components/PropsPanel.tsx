import type { IPropsPanelProps } from "../interfaces/props";
import type { ButtonConfig, ComponentConfig } from "../interfaces";
import { ButtonConfigItem } from "./ButtonConfigItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Accordion } from "./ui/accordion";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function PropsPanel({ config, onConfigChange }: IPropsPanelProps) {
  const updateConfig = (updates: Partial<ComponentConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const updateButton = (
    buttonName: keyof Pick<
      ComponentConfig,
      | "newButton"
      | "loadButton"
      | "saveButton"
      | "downloadButton"
      | "toggleButton"
    >,
    updates: Partial<ButtonConfig>
  ) => {
    updateConfig({
      [buttonName]: { ...config[buttonName], ...updates },
    });
  };

  return (
    <Card className="border-input">
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base">Mode</Label>
          <RadioGroup
            value={config.mode}
            onValueChange={(value) =>
              updateConfig({ mode: value as "editor" | "viewer" })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="editor" id="editor" />
              <Label htmlFor="editor" className="font-normal cursor-pointer">
                Editor
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="viewer" id="viewer" />
              <Label htmlFor="viewer" className="font-normal cursor-pointer">
                Viewer
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {config.mode === "editor" && (
          <>
            <div className="space-y-4">
              <Label className="text-base">Toolbar Configuration</Label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="toolbar-position">Position</Label>
                  <Select
                    value={config.toolbarPosition}
                    onValueChange={(value) =>
                      updateConfig({
                        toolbarPosition: value as "top" | "bottom",
                      })
                    }
                  >
                    <SelectTrigger id="toolbar-position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="toolbar-side">Side</Label>
                  <Select
                    value={config.toolbarSide}
                    onValueChange={(value) =>
                      updateConfig({ toolbarSide: value as "left" | "right" })
                    }
                  >
                    <SelectTrigger id="toolbar-side">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="toolbar-orientation">Orientation</Label>
                  <Select
                    value={config.toolbarOrientation}
                    onValueChange={(value) =>
                      updateConfig({
                        toolbarOrientation: value as "horizontal" | "vertical",
                      })
                    }
                  >
                    <SelectTrigger id="toolbar-orientation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="toolbar-spacing">Spacing</Label>
                  <Select
                    value={config.toolbarSpacing}
                    onValueChange={(value) =>
                      updateConfig({
                        toolbarSpacing: value as "sm" | "md" | "lg",
                      })
                    }
                  >
                    <SelectTrigger id="toolbar-spacing">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base">Toolbar Buttons</Label>
              <Accordion type="single" collapsible className="w-full">
                <ButtonConfigItem
                  buttonName="newButton"
                  displayName="New"
                  button={config.newButton}
                  onUpdate={(updates) => updateButton("newButton", updates)}
                />
                <ButtonConfigItem
                  buttonName="loadButton"
                  displayName="Load"
                  button={config.loadButton}
                  onUpdate={(updates) => updateButton("loadButton", updates)}
                />
                <ButtonConfigItem
                  buttonName="saveButton"
                  displayName="Save"
                  button={config.saveButton}
                  onUpdate={(updates) => updateButton("saveButton", updates)}
                />
                <ButtonConfigItem
                  buttonName="downloadButton"
                  displayName="Download"
                  button={config.downloadButton}
                  onUpdate={(updates) =>
                    updateButton("downloadButton", updates)
                  }
                />
                <ButtonConfigItem
                  buttonName="toggleButton"
                  displayName="Toggle View"
                  button={config.toggleButton}
                  onUpdate={(updates) => updateButton("toggleButton", updates)}
                />
              </Accordion>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

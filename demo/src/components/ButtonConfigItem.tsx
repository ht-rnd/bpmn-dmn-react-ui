import type { IButtonConfigItemProps } from "../interfaces/props";
import type { ButtonVariant } from "../interfaces";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export function ButtonConfigItem({
  buttonName,
  displayName,
  button,
  onUpdate,
}: IButtonConfigItemProps) {
  return (
    <AccordionItem value={buttonName} className="border-input">
      <AccordionTrigger className="text-sm">{displayName}</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${buttonName}-hidden`} className="font-normal">
              Hidden
            </Label>
            <Switch
              id={`${buttonName}-hidden`}
              checked={button.hidden}
              onCheckedChange={(checked) => onUpdate({ hidden: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${buttonName}-label`}>Label</Label>
            <Input
              id={`${buttonName}-label`}
              value={button.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${buttonName}-variant`}>Variant</Label>
            <Select
              value={button.variant}
              onValueChange={(value) =>
                onUpdate({ variant: value as ButtonVariant })
              }
            >
              <SelectTrigger id={`${buttonName}-variant`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="destructive">Destructive</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${buttonName}-className`}>Class Name</Label>
            <Input
              id={`${buttonName}-className`}
              value={button.className}
              onChange={(e) => onUpdate({ className: e.target.value })}
              placeholder="Custom CSS classes"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

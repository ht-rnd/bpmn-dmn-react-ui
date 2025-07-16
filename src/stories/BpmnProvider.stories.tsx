import type { Meta, StoryObj } from "@storybook/react";
import { BpmnProvider, BpmnEditor } from "../lib";

const meta: Meta<typeof BpmnProvider> = {
  title: "Components/BpmnProvider",
  component: BpmnProvider,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof BpmnProvider>;

export const Provider: Story = {
  args: {
    theme: undefined,
    children: (
      <div className="h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
        <BpmnEditor />
      </div>
    ),
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { DmnEditor, DmnProvider } from "../lib";

const meta: Meta<typeof DmnProvider> = {
  title: "Components/DmnProvider",
  component: DmnProvider,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof DmnProvider>;

export const Provider: Story = {
  args: {
    theme: undefined,
    children: (
      <div
        className="h-screen"
        style={{ backgroundColor: "hsl(var(--background))" }}
      >
        <DmnEditor />
      </div>
    ),
  },
};

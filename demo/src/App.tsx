import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import type { ComponentConfig } from "./interfaces";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage";
import { BpmnPage } from "./pages/BpmnPage";
import { DmnPage } from "./pages/DmnPage";

const defaultConfig: ComponentConfig = {
  mode: "editor",
  toolbarPosition: "top",
  toolbarSide: "right",
  toolbarOrientation: "horizontal",
  toolbarSpacing: "md",
  newButton: {
    hidden: false,
    label: "New",
    variant: "default",
    className: "",
  },
  loadButton: {
    hidden: false,
    label: "Load",
    variant: "default",
    className: "",
  },
  saveButton: {
    hidden: false,
    label: "Save",
    variant: "default",
    className: "",
  },
  downloadButton: {
    hidden: false,
    label: "Download",
    variant: "default",
    className: "",
  },
  toggleButton: {
    hidden: false,
    label: "Toggle View",
    variant: "default",
    className: "",
  },
};

export const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [bpmnConfig, setBpmnConfig] = useState<ComponentConfig>(defaultConfig);
  const [dmnConfig, setDmnConfig] = useState<ComponentConfig>(defaultConfig);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  return (
    <div className={`${theme} bg-background text-foreground`}>
      <Header theme={theme} onThemeChange={handleThemeChange} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/bpmn"
          element={
            <BpmnPage
              theme={theme}
              config={bpmnConfig}
              onConfigChange={setBpmnConfig}
            />
          }
        />
        <Route
          path="/dmn"
          element={
            <DmnPage
              theme={theme}
              config={dmnConfig}
              onConfigChange={setDmnConfig}
            />
          }
        />
      </Routes>
    </div>
  );
};

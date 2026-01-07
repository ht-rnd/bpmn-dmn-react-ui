import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AppContextType, ComponentConfig } from "../interfaces";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const defaultConfig: ComponentConfig = {
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [bpmnConfig, setBpmnConfig] = useState<ComponentConfig>(defaultConfig);
  const [dmnConfig, setDmnConfig] = useState<ComponentConfig>(defaultConfig);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        bpmnConfig,
        setBpmnConfig,
        dmnConfig,
        setDmnConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}

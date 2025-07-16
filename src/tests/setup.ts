import { vi } from "vitest";

vi.mock("bpmn-js/lib/Modeler", () => ({
  default: vi.fn(() => ({
    importXML: vi.fn().mockResolvedValue({}),
    createDiagram: vi.fn().mockResolvedValue({}),
    on: vi.fn(),
    get: vi.fn().mockImplementation((service) => {
      if (service === "canvas") {
        return {
          zoom: vi.fn(),
          viewbox: vi.fn(),
        };
      }
      return {};
    }),
    destroy: vi.fn(),
    attachTo: vi.fn(),
    detach: vi.fn(),
    saveXML: vi.fn().mockResolvedValue({
      xml: '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"></bpmn:definitions>',
    }),
    saveSVG: vi.fn().mockResolvedValue({
      svg: "<svg></svg>",
    }),
  })),
}));

vi.mock("bpmn-js-bpmnlint", () => ({
  default: {},
}));

vi.mock("bpmn-js-color-picker", () => ({
  default: {},
}));

vi.mock("bpmn-js-properties-panel", () => ({
  BpmnPropertiesPanelModule: {},
  BpmnPropertiesProviderModule: {},
  ZeebePropertiesProviderModule: {},
}));

vi.mock("diagram-js-minimap", () => ({
  default: {},
}));

vi.mock("diagram-js/lib/util/EscapeUtil", () => ({
  default: {},
}));

vi.mock("zeebe-bpmn-moddle/resources/zeebe", () => ({
  default: {},
}));

vi.mock("camunda-bpmn-js-behaviors/lib/camunda-cloud", () => ({
  default: {},
}));

global.FileReader = class FileReader {
  onload: ((event: any) => void) | null = null;
  readAsText(file: File) {
    if (this.onload) {
      let content = file.name;
      if (file.name.includes(".bpmn")) {
        content = "<bpmn:definitions></bpmn:definitions>";
      } else if (file.name.includes(".dmn")) {
        content = "<dmn:definitions></dmn:definitions>";
      }
      this.onload({ target: { result: content } });
    }
  }
} as any;

vi.mock("../lib/components/Bpmn/BpmnProvider", async () => {
  const actual = await vi.importActual("../lib/components/Bpmn/BpmnProvider");
  return {
    ...actual,
    useBpmnContext: vi.fn(),
  };
});

vi.mock("dmn-js/lib/Modeler", () => ({
  default: vi.fn(() => ({
    importXML: vi.fn().mockResolvedValue({}),
    saveXML: vi.fn().mockResolvedValue({
      xml: "<dmn:definitions></dmn:definitions>",
    }),
    getActiveViewer: vi.fn().mockReturnValue({
      get: vi.fn().mockImplementation((service) => {
        if (service === "canvas") {
          return {
            zoom: vi.fn(),
            viewbox: vi.fn(),
          };
        }
        if (service === "eventBus") {
          return {
            on: vi.fn(),
            off: vi.fn(),
            fire: vi.fn(),
          };
        }
        return {};
      }),
    }),
    destroy: vi.fn(),
  })),
}));

vi.mock("../lib/components/Dmn/DmnProvider", async () => {
  const actual = await vi.importActual("../lib/components/Dmn/DmnProvider");
  return {
    ...actual,
    useDmnContext: vi.fn(),
  };
});

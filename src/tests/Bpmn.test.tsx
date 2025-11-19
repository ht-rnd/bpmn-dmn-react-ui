import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi, it, beforeAll } from "vitest";
import { BpmnProvider, BpmnEditor, BpmnToolbar, useBpmnContext } from "../lib";

describe("BPMN Components", () => {
  const mockHandleNewDiagram = vi.fn();
  const mockHandleDownloadDiagram = vi.fn();
  const mockHandleSaveDiagram = vi.fn();
  const mockHandleToggleView = vi.fn();
  const mockHandleLoadDiagram = vi.fn();

  beforeAll(() => {
    vi.mocked(useBpmnContext).mockReturnValue({
      editorRef: { current: null },
      handleNewDiagram: mockHandleNewDiagram,
      handleLoadDiagram: mockHandleLoadDiagram,
      handleSaveDiagram: mockHandleSaveDiagram,
      handleDownloadDiagram: mockHandleDownloadDiagram,
      handleToggleView: mockHandleToggleView,
      isEditorView: true,
      setIsEditorView: vi.fn(),
    });
  });

  it("should trigger correct actions", () => {
    render(<BpmnToolbar />);

    const newButton = screen.getByText("New BPMN");
    const loadButton = screen.getByText("Upload");
    const saveButton = screen.getByText("Save");
    const downloadButton = screen.getByText("Download");
    const toggleButton = screen.getByText("Toggle View");

    expect(newButton).toBeInTheDocument();
    expect(loadButton).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(newButton);
    expect(mockHandleNewDiagram).toHaveBeenCalledTimes(1);

    fireEvent.click(saveButton);
    expect(mockHandleSaveDiagram).toHaveBeenCalledTimes(1);

    fireEvent.click(downloadButton);
    expect(mockHandleDownloadDiagram).toHaveBeenCalledTimes(1);

    fireEvent.click(toggleButton);
    expect(mockHandleToggleView).toHaveBeenCalledTimes(1);
  });

  it("should trigger file input", async () => {
    render(<BpmnToolbar />);

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    expect(fileInput).toBeInTheDocument();
    expect(fileInput.style.display).toBe("none");

    const file = new File(
      ["<bpmn:definitions></bpmn:definitions>"],
      "test.bpmn",
      {
        type: "application/xml",
      }
    );

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockHandleLoadDiagram).toHaveBeenCalledWith(
        "<bpmn:definitions></bpmn:definitions>"
      );
    });
  });

  it("should display custom toolbar", () => {
    const customConfig = {
      orientation: "vertical" as const,
      spacing: "lg" as const,
      new: { hidden: true },
      load: { label: "Custom Load", variant: "default" as const },
    };

    render(<BpmnToolbar config={customConfig} />);

    expect(screen.queryByText("New BPMN")).not.toBeInTheDocument();
    expect(screen.getByText("Custom Load")).toBeInTheDocument();
  });

  it("should integrate BpmnEditor with BpmnProvider", async () => {
    const mockSetXML = vi.fn();
    const mockGetXML = vi.fn().mockResolvedValue("<mock-xml/>");

    vi.mocked(useBpmnContext).mockReturnValue({
      editorRef: {
        current: {
          setXML: mockSetXML,
          getXML: mockGetXML,
        },
      },
      handleNewDiagram: vi.fn(),
      handleLoadDiagram: vi.fn(),
      handleDownloadDiagram: vi.fn(),
      handleSaveDiagram: vi.fn(),
      handleToggleView: vi.fn(),
      isEditorView: true,
      setIsEditorView: vi.fn(),
    });

    const { container } = render(
      <BpmnProvider>
        <BpmnEditor />
      </BpmnProvider>
    );

    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
      const divElements = container.querySelectorAll("div");
      expect(divElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("should render XML view when not in editor view", () => {
    const mockXML = "<dmn:definitions></dmn:definitions>";

    vi.mocked(useBpmnContext).mockReturnValue({
      editorRef: { current: null },
      handleNewDiagram: vi.fn(),
      handleLoadDiagram: vi.fn(),
      handleDownloadDiagram: vi.fn(),
      handleSaveDiagram: vi.fn(),
      handleToggleView: vi.fn(),
      isEditorView: false,
      setIsEditorView: vi.fn(),
    });

    render(<BpmnEditor initialXML={mockXML} />);

    expect(screen.getByText(mockXML)).toBeInTheDocument();
  });
});

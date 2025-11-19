import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi, it, beforeAll } from "vitest";
import { DmnProvider, DmnEditor, DmnToolbar, useDmnContext } from "../lib";

describe("DMN Components", () => {
  const mockHandleNewDiagram = vi.fn();
  const mockHandleDownloadDiagram = vi.fn();
  const mockHandleSaveDiagram = vi.fn();
  const mockHandleToggleView = vi.fn();
  const mockHandleLoadDiagram = vi.fn();

  beforeAll(() => {
    vi.mocked(useDmnContext).mockReturnValue({
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
    render(<DmnToolbar />);

    const newButton = screen.getByText("New DMN");
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
    render(<DmnToolbar />);

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    expect(fileInput).toBeInTheDocument();

    const file = new File(["<dmn:definitions></dmn:definitions>"], "test.dmn", {
      type: "application/xml",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockHandleLoadDiagram).toHaveBeenCalledWith(
        "<dmn:definitions></dmn:definitions>"
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

    render(<DmnToolbar config={customConfig} />);

    expect(screen.queryByText("New DMN")).not.toBeInTheDocument();
    expect(screen.getByText("Custom Load")).toBeInTheDocument();
  });

  it("should integrate DmnEditor with DmnProvider", async () => {
    const mockSetXML = vi.fn();
    const mockGetXML = vi
      .fn()
      .mockResolvedValue("<dmn:definitions></dmn:definitions>");

    vi.mocked(useDmnContext).mockReturnValue({
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
      <DmnProvider>
        <DmnEditor />
      </DmnProvider>
    );

    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
      const divElements = container.querySelectorAll("div");
      expect(divElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should render XML view when not in editor view", () => {
    const mockXML = "<dmn:definitions></dmn:definitions>";

    vi.mocked(useDmnContext).mockReturnValue({
      editorRef: { current: null },
      handleNewDiagram: vi.fn(),
      handleLoadDiagram: vi.fn(),
      handleDownloadDiagram: vi.fn(),
      handleSaveDiagram: vi.fn(),
      handleToggleView: vi.fn(),
      isEditorView: false,
      setIsEditorView: vi.fn(),
    });

    render(<DmnEditor initialXML={mockXML} />);

    expect(screen.getByText(mockXML)).toBeInTheDocument();
  });
});

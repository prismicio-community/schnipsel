import { VSCodeRenderer } from "./VSCodeRenderer";

export { Renderer, RenderedSnippet, RenderedSnippetFile } from "./Renderer";

export { VSCodeRenderer } from "./VSCodeRenderer";

export const Renderers = {
	vscode: VSCodeRenderer,
	vim: VSCodeRenderer,
};

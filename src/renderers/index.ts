import { SchnipselConfig } from "../types";

import { VisualStudioCodeRenderer } from "./VisualStudioCodeRenderer";
import { SublimeTextRenderer } from "./SublimeTextRenderer";
import { IntelliJIDEARenderer } from "./IntelliJIDEARenderer";

export { Renderer, RenderedSnippet, RenderedSnippetFile } from "./Renderer";

export {
	VISUAL_STUDIO_CODE_SCOPE_RESOLVER,
	SUBLIME_TEXT_SCOPE_RESOLVER,
	INTELLIJ_IDEA_SCOPE_RESOLVER,
} from "./scopeResolvers";

export { VisualStudioCodeRenderer } from "./VisualStudioCodeRenderer";
export { SublimeTextRenderer } from "./SublimeTextRenderer";
export { IntelliJIDEARenderer } from "./IntelliJIDEARenderer";

export const Renderers: Record<
	SchnipselConfig["renderers"][number]["name"],
	| typeof VisualStudioCodeRenderer
	| typeof SublimeTextRenderer
	| typeof IntelliJIDEARenderer
> = {
	// Visual Studio Code
	visualstudiocode: VisualStudioCodeRenderer,
	vscode: VisualStudioCodeRenderer,
	vim: VisualStudioCodeRenderer,

	// Sublime Text
	sublimetext: SublimeTextRenderer,
	sublime: SublimeTextRenderer,

	// IntelliJ IDEA
	intellijidea: IntelliJIDEARenderer,
	intellij: IntelliJIDEARenderer,
};

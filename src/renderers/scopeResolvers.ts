export const VISUAL_STUDIO_CODE_SCOPE_RESOLVER = (scope: string) => scope;

export const SUBLIME_TEXT_SCOPE_RESOLVER = {
	html: "text.html",
	javascript: "source.js",
	javascriptreact: "source.jsx",
	typescript: "source.ts",
	typescriptreact: "source.tsx",
	"vue-html": "text.html.vue",
	vue: "text.html.vue",
};

export const INTELLIJ_IDEA_SCOPE_RESOLVER = (scope: string) =>
	scope.replace(/-/g, "").toUpperCase();

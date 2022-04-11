import { defineSchnipselConfig } from "./";

export default defineSchnipselConfig({
	input: {
		directory: "playground/src",
	},
	renderers: [
		{
			name: "vscode",
			options: {
				outputDirectory: "playground/vscode/snippets",
				packageJSON: "playground/vscode/package.json",
			},
		},
		{
			name: "sublime",
			options: {
				outputDirectory: "playground/sublime/snippets",
			},
		},
		{
			name: "intellij",
			options: {
				outputDirectory: "playground/intellij/snippets",
				pluginXML: "playground/intellij/plugin.xml",
			},
		},
	],
});

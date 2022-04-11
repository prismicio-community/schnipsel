import { defineSchnipselConfig } from "../../../src";

export default defineSchnipselConfig({
	input: {
		directory: "src",
	},

	// Update or remove renderers according to desired result...
	renderers: [
		{
			name: "vscode",
			options: {
				outputDirectory: "vscode/snippets",
				packageJSON: "vscode/package.json",
			},
		},
		{
			name: "sublime",
			options: {
				outputDirectory: "sublime/snippets",
			},
		},
		{
			name: "intellij",
			options: {
				outputDirectory: "intellij/snippets",
				pluginXML: "intellij/plugin.xml",
			},
		},
	],
});

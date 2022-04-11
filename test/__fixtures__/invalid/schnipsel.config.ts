import { defineSchnipselConfig, SchnipselConfig } from "../../../src";

export default defineSchnipselConfig({
	input: {},

	// Update or remove renderers according to desired result...
	renderers: [
		{},
		{
			name: 1,
			options: {
				outputDirectory: 1,
			},
		},
	],
} as unknown as SchnipselConfig);

export type InputConfig = {
	directory: string;
	glob?: string | string[];
};

export type RendererConfig = string;

export type Config = {
	input: InputConfig;
	renderers: RendererConfig[];
};

export type SnippetObject = {
	name: string;
	description: string;
	scope: string[];
	prefix: string;
	body: string;
};

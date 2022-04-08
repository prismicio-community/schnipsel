export type InputConfig = {
	directory: string;
	glob?: string | string[];
};

export type RendererOptions = {
	outputDirectory: string;
	passthroughFileCopy?: Record<string, string>;
};
export type VSCodeRendererOptions = { packageJSON?: string } & RendererOptions;

export type RendererConfig<
	TName extends string,
	TOptions extends RendererOptions,
> = {
	name: TName;
	options: TOptions;
};

export type AllRendererConfig = RendererConfig<"vscode", VSCodeRendererOptions>;

export type Config = {
	input: InputConfig;
	renderers: AllRendererConfig[];
};

export type SnippetObject = {
	name: string;
	description: string;
	scope: string[];
	prefix: string;
	body: string;
};

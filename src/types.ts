export type InputConfig = {
	/**
	 * Base directory where to look for input files, typically `./src`.
	 */
	directory: string;

	/**
	 * An optional glob or glob array to match input files in `directory`.
	 *
	 * @defaultValue `"**\/*.md"`
	 *
	 * @see Globby `patterns` parameter {@link https://github.com/sindresorhus/globby#patterns}
	 */
	glob?: string | string[];
};

export type RendererOptions = {
	/**
	 * Output directory where to write rendered snippets.
	 */
	outputDirectory: string;

	/**
	 * An optional map mapping input file paths from CWD to output file paths to
	 * copy after render.
	 */
	passthroughFileCopy?: Record<string, string>;

	/**
	 * A map mapping input scopes to output scopes or a function receiving an
	 * input scope and returning an output scope.
	 */
	scopeResolver?: Record<string, string> | ((scope: string) => string);
};

export type VisualStudioCodeRendererOptions = {
	/**
	 * An optional path to a `package.json` file where to write the
	 * `contributes.snippets` map of Visual Studio Code extensions.
	 */
	packageJSON?: string;
} & RendererOptions;

export type SublimeTextRendererOptions = RendererOptions;

export type IntelliJIDEARendererOptions = {
	/**
	 * An optional path to a `plugin.xml` file where to write the `<extensions />`
	 * default live templates of an IntelliJ IDEA plugin.
	 */
	pluginXML?: string;
} & RendererOptions;

export type RendererConfig<
	TName extends string,
	TOptions extends RendererOptions,
> = {
	/**
	 * Name of the renderer.
	 */
	name: TName;

	/**
	 * Options to pass to the renderer.
	 */
	options: TOptions;
};

export type AllRendererConfig =
	| RendererConfig<
			"visualstudiocode" | "vscode" | "vim",
			VisualStudioCodeRendererOptions
	  >
	| RendererConfig<"sublimetext" | "sublime", SublimeTextRendererOptions>
	| RendererConfig<"intellijidea" | "intellij", IntelliJIDEARendererOptions>;

/**
 * Schnipsel configuration.
 */
export type SchnipselConfig = {
	/**
	 * Configures where and how Schnipsel should look for input files.
	 */
	input: InputConfig;

	/**
	 * Configures renderers that should be applied to found input files.
	 */
	renderers: AllRendererConfig[];
};

export type SnippetObject = {
	name: string;
	description: string;
	scopes: string[];
	prefix: string;
	body: string;
};

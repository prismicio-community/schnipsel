import { join } from "node:path";
import { writeFile, copyFile, rm, mkdir } from "node:fs/promises";

import _debug from "debug";

import { NAME } from "../const";
import { RendererOptions, SnippetObject } from "../types";

export type BatchedSnippets = { scope: string; snippets: SnippetObject[] };
export type RenderedSnippet = string | Record<string, unknown>;
export type RenderedSnippetFile = {
	name: string;
	scope: string;
	body: string;
};

export abstract class Renderer<
	TOptions extends RendererOptions = RendererOptions,
> {
	private _name: string;
	get name() {
		return this._name;
	}

	private _options: TOptions;
	get options() {
		return this._options;
	}

	protected cwd: string;
	protected debug: (...str: string[]) => void;

	constructor(name: string, options: TOptions, cwd = process.cwd()) {
		this._name = name;
		this._options = options;
		this.cwd = cwd;
		this.debug = _debug(`${NAME}:${name}`);
	}

	protected async createOutputDirectory(): Promise<void> {
		this.debug("Creating %o", this.options.outputDirectory);

		const path = join(this.cwd, this.options.outputDirectory);
		try {
			await rm(path, { recursive: true });
		} catch (error) {
			// Ignore
		}

		await mkdir(path, { recursive: true });

		this.debug("Created %o!", this.options.outputDirectory);
	}

	protected async copyPassthroughFiles(): Promise<void> {
		if (this.options.passthroughFileCopy) {
			await Promise.all(
				Object.entries(this.options.passthroughFileCopy).map(
					async ([inputFile, outputFile]) => {
						this.debug("Copying %o to %o", inputFile, outputFile);

						await copyFile(
							join(this.cwd, inputFile),
							join(this.cwd, this.options.outputDirectory, outputFile),
						);

						this.debug("Copied %o to %o!", inputFile, outputFile);
					},
				),
			);
		}
	}

	protected async writeSnippetFile(
		snippetFile: RenderedSnippetFile,
	): Promise<void> {
		this.debug("Writting %o", snippetFile.name);
		const path = join(this.cwd, this.options.outputDirectory, snippetFile.name);

		await writeFile(path, snippetFile.body, "utf8");
	}

	protected async writeSnippetFiles(
		snippetFiles: RenderedSnippetFile[],
	): Promise<void> {
		await Promise.all(
			snippetFiles.map((snippetFile) => this.writeSnippetFile(snippetFile)),
		);
	}

	protected abstract renderSnippet(
		snippet: SnippetObject,
		scope: string,
	): RenderedSnippet;

	protected abstract renderSnippetFile(
		batchedSnippets: BatchedSnippets,
	): RenderedSnippetFile;

	protected renderSnippetFiles(
		batchedSnippetsArray: BatchedSnippets[],
	): RenderedSnippetFile[] {
		return batchedSnippetsArray.map((batchedSnippets) =>
			this.renderSnippetFile(batchedSnippets),
		);
	}

	protected abstract batchSnippets(
		snippets: SnippetObject[],
	): BatchedSnippets[];

	abstract render(snippets: SnippetObject[]): Promise<void>;
}

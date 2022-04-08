import { join, relative } from "node:path";
import { JSONFile, JSONFileMeta } from "../lib";

import { SnippetObject, VSCodeRendererOptions } from "../types";
import {
	BatchedSnippets,
	RenderedSnippet,
	RenderedSnippetFile,
	Renderer,
} from "./Renderer";

export class VSCodeRenderer extends Renderer<VSCodeRendererOptions> {
	private _jsonMeta: JSONFileMeta;

	constructor(options: VSCodeRendererOptions, cwd = process.cwd()) {
		super("vscode", options, cwd);

		this._jsonMeta = { indent: "  " };
	}

	protected renderSnippet(
		snippet: SnippetObject,
		scope: string,
	): RenderedSnippet {
		return {
			[snippet.name]: {
				scope,
				prefix: snippet.prefix,
				description: snippet.description,
				body: snippet.body.split("\n"),
			},
		};
	}

	protected renderSnippetFile(
		batchedSnippets: BatchedSnippets,
	): RenderedSnippetFile {
		return {
			name: `${batchedSnippets.scope}.code-snippets`,
			scope: batchedSnippets.scope,
			body: `${JSON.stringify(
				batchedSnippets.snippets
					.map((snippet) => this.renderSnippet(snippet, batchedSnippets.scope))
					.reduce<Record<string, unknown>>((acc, renderedSnippet) => {
						return { ...acc, ...(renderedSnippet as Record<string, unknown>) };
					}, {}),
				null,
				this._jsonMeta.indent,
			)}\n`,
		};
	}

	protected batchSnippets(snippets: SnippetObject[]): BatchedSnippets[] {
		return Object.values(
			snippets.reduce<Record<string, BatchedSnippets>>(
				(batchedSnippets, snippet) => {
					snippet.scope.forEach((scope) => {
						batchedSnippets[scope] ||= {
							scope,
							snippets: [],
						};

						batchedSnippets[scope].snippets.push(snippet);
					});

					return batchedSnippets;
				},
				{},
			),
		);
	}

	protected async updatePackageJSON(snippetFiles: RenderedSnippetFile[]) {
		if (!this.options.packageJSON) {
			throw new TypeError("No package.json file specified in renderer options");
		}

		this.debug("Updating %o", this.options.packageJSON);

		const snippets = snippetFiles.map((snippetFile) => ({
			language: snippetFile.scope,
			path: join(
				relative(
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					join(this.cwd, this.options.packageJSON!),
					join(this.cwd, this.options.outputDirectory),
				),
				snippetFile.name,
			),
		}));

		const pkgJSONFile = new JSONFile<{
			contributes?: { snippets?: { language: string; path: string }[] };
		}>(this.options.packageJSON, this.cwd);
		const pkgJSON = await pkgJSONFile.read();
		pkgJSON.contributes ||= {};
		pkgJSON.contributes.snippets = snippets;
		await pkgJSONFile.write(pkgJSON);

		this.debug("%o updated!", this.options.packageJSON);
	}

	async render(snippets: SnippetObject[]): Promise<void> {
		// Grab JSON meta for `this.renderSnippetFile()`
		try {
			this._jsonMeta = await new JSONFile(
				this.options.packageJSON || "package.json",
				this.cwd,
			).readMeta();
		} catch (error) {
			// Ignore
		}

		await this.createOutputDirectory();

		const snippetFiles = this.renderSnippetFiles(this.batchSnippets(snippets));

		const tasks = [
			this.writeSnippetFiles(snippetFiles),
			this.copyPassthroughFiles(),
		];
		if (this.options.packageJSON) {
			tasks.push(this.updatePackageJSON(snippetFiles));
		}

		await Promise.all(tasks);
	}
}

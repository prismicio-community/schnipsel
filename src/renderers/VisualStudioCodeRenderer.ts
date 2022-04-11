import { join, relative, dirname } from "node:path/posix";

import chalk from "chalk";

import { JSONFile, JSONFileMeta } from "../lib";
import { SnippetObject, VisualStudioCodeRendererOptions } from "../types";
import { BatchedSnippets, RenderedSnippetFile, Renderer } from "./Renderer";
import { VISUAL_STUDIO_CODE_SCOPE_RESOLVER } from "./scopeResolvers";

export class VisualStudioCodeRenderer extends Renderer<VisualStudioCodeRendererOptions> {
	private _jsonMeta: JSONFileMeta;

	constructor(options: VisualStudioCodeRendererOptions, cwd = process.cwd()) {
		super(
			"vscode",
			{ scopeResolver: VISUAL_STUDIO_CODE_SCOPE_RESOLVER, ...options },
			cwd,
		);

		this._jsonMeta = { indent: "  " };
	}

	protected renderSnippet(
		snippet: SnippetObject,
		scope: string,
	): Record<string, unknown> {
		return {
			[snippet.name]: {
				scope: this.resolveScope(scope),
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
					snippet.scopes.forEach((scope) => {
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
			throw new TypeError(
				`No ${chalk.cyan("package.json")} file specified in renderer options`,
			);
		}

		this.debug("Updating %o", this.options.packageJSON);

		const snippets = snippetFiles
			.sort((a, b) => (a.scope > b.scope ? 1 : -1))
			.map((snippetFile) => ({
				language: snippetFile.scope,
				path: `./${join(
					relative(
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						join(this.cwd, dirname(this.options.packageJSON!)),
						join(this.cwd, this.options.outputDirectory),
					),
					snippetFile.name,
				)}`,
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

	async render(snippets: SnippetObject[]): Promise<RenderedSnippetFile[]> {
		// Grab JSON meta for `this.renderSnippetFile()`
		try {
			this._jsonMeta = await new JSONFile(
				this.options.packageJSON || "package.json",
				this.cwd,
			).readMeta();
		} catch (error) {
			// Ignore
		}

		const snippetFiles = await super.render(snippets, true);

		if (this.options.packageJSON) {
			this.tasks.push(this.updatePackageJSON(snippetFiles));
		}

		await Promise.all(this.tasks);

		return snippetFiles;
	}
}

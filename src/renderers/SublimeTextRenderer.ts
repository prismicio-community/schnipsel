import escapeHTML from "escape-html";

import { escapeXML } from "../lib";
import { SnippetObject, SublimeTextRendererOptions } from "../types";
import { BatchedSnippets, RenderedSnippetFile, Renderer } from "./Renderer";
import { SUBLIME_TEXT_SCOPE_RESOLVER } from "./scopeResolvers";

export class SublimeTextRenderer extends Renderer<SublimeTextRendererOptions> {
	constructor(options: SublimeTextRendererOptions, cwd = process.cwd()) {
		super(
			"sublime",
			{ scopeResolver: SUBLIME_TEXT_SCOPE_RESOLVER, ...options },
			cwd,
		);
	}

	protected renderSnippet(snippet: SnippetObject, scope: string): string {
		return escapeXML(/* xml */ `<snippet>
	<content><![CDATA[
${snippet.body}
]]></content>
	<tabTrigger>${escapeHTML(snippet.prefix)}</tabTrigger>
	<scope>${escapeHTML(this.resolveScope(scope))}</scope>
	<description>${escapeHTML(snippet.description)}</description>
</snippet>
`);
	}

	protected renderSnippetFile(
		batchedSnippets: BatchedSnippets,
	): RenderedSnippetFile {
		const [snippet] = batchedSnippets.snippets;

		return {
			name: `${batchedSnippets.scope}-${snippet.name
				.toLowerCase()
				.replace(/\s/g, "-")}.sublime-snippet`,
			scope: batchedSnippets.scope,
			body: this.renderSnippet(snippet, batchedSnippets.scope),
		};
	}

	protected batchSnippets(snippets: SnippetObject[]): BatchedSnippets[] {
		return snippets
			.map((snippet) => {
				return (
					snippet.scopes
						// TODO: Consider a `scopeFilter` option
						.filter(
							(scope, _, arr) =>
								!(scope === "html" && arr.includes("vue-html")),
						)
						.map((scope) => {
							return {
								scope,
								snippets: [snippet],
							};
						})
				);
			})
			.flat();
	}
}

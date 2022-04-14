import chalk from "chalk";
import escapeHTML from "escape-html";

import { XMLFile } from "../lib";
import { SnippetObject, IntelliJIDEARendererOptions } from "../types";
import { BatchedSnippets, RenderedSnippetFile, Renderer } from "./Renderer";
import { INTELLIJ_IDEA_SCOPE_RESOLVER } from "./scopeResolvers";

export class IntelliJIDEARenderer extends Renderer<IntelliJIDEARendererOptions> {
	constructor(options: IntelliJIDEARendererOptions, cwd = process.cwd()) {
		super(
			"intellij",
			{ scopeResolver: INTELLIJ_IDEA_SCOPE_RESOLVER, ...options },
			cwd,
		);
	}

	protected renderSnippet(snippet: SnippetObject, scope: string): string {
		/**
		 * @see Regex101 expression: {@link https://regex101.com/r/e1TjuV/1}
		 */
		const VARIABLE_REGEX = /\${(?<name>\d+)(:(?<default>[^$]+?))?}/gim;
		const VARIABLE_CLEANUP_REGEX = /\${\d+:(.+?)}/gim;

		// Resolve body and variables
		let body = snippet.body;
		const variableRegex = new RegExp(VARIABLE_REGEX);
		const variables: Record<string, string> = {};
		let match: RegExpExecArray | null;
		while ((match = variableRegex.exec(snippet.body))) {
			if (match.groups && match.groups.name) {
				body = body.replace(match[0], `$${match.groups.name}$`);
				variables[match.groups.name] = match.groups.default ?? "";
			}
		}
		body = escapeHTML(body)
			.replace(VARIABLE_CLEANUP_REGEX, "$1")
			// Unescape escaped non-variables
			.replace(/\\(\${)/g, "$1")
			.replace(/\n/g, "&#10;");

		return /* xml */ `<template
		name="${escapeHTML(snippet.prefix)}"
		value="${body}"
		description="${escapeHTML(snippet.description)}"
		toReformat="true"
		toShortenFQNames="true"
	>${"1" in variables ? "\n\t\t" : ""}${Object.entries(variables)
			.map(
				([name, defaultValue]) =>
					/* xml */ `<variable name="${escapeHTML(name)}" expression="${
						defaultValue ? escapeHTML(`enum("${defaultValue}")`) : ""
					}" defaultValue="${escapeHTML(defaultValue)}" alwaysStopAt="true"/>`,
			)
			.join("\n\t\t")}
		<context>
			<option name="${escapeHTML(this.resolveScope(scope))}" value="true"/>
		</context>
	</template>`;
	}

	protected renderSnippetFile(
		batchedSnippets: BatchedSnippets,
	): RenderedSnippetFile {
		return {
			name: `${batchedSnippets.scope}.xml`,
			scope: batchedSnippets.scope,
			body: `<templateSet group="${batchedSnippets.scope}">
	${batchedSnippets.snippets
		.sort((a, b) => (a.name > b.name ? 1 : -1))
		.map((snippet) => this.renderSnippet(snippet, batchedSnippets.scope))
		.join("\n\t")}
</templateSet>
`,
		};
	}

	protected batchSnippets(snippets: SnippetObject[]): BatchedSnippets[] {
		return Object.values(
			snippets.reduce<Record<string, BatchedSnippets>>(
				(batchedSnippets, snippet) => {
					snippet.scopes
						// TODO: Consider a `scopeFilter` option
						.filter(
							(scope, _, arr) =>
								!(scope === "html" && arr.includes("vue-html")),
						)
						.forEach((scope) => {
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

	protected async updatePluginXML(
		snippetFiles: RenderedSnippetFile[],
	): Promise<void> {
		if (!this.options.pluginXML) {
			throw new TypeError(
				`No ${chalk.cyan("plugin.xml")} file specified in renderer options`,
			);
		}

		this.debug("Updating %o", this.options.pluginXML);

		const extensions = snippetFiles
			.map((snippetFile) => snippetFile.name)
			.sort()
			.map((name) => `<defaultLiveTemplates file="/liveTemplates/${name}"/>`)
			.join("\n\t\t");

		const pluginXMLFile = new XMLFile(this.options.pluginXML, this.cwd);
		let pluginXML = await pluginXMLFile.read();
		if (
			pluginXML.includes("<!--SCHNIPSEL-->") &&
			pluginXML.includes("<!--ENDSCHNIPSEL-->")
		) {
			pluginXML = pluginXML.replace(
				/<!--SCHNIPSEL-->([\s\S]*?)<!--ENDSCHNIPSEL-->/,
				`<!--SCHNIPSEL-->\n\t\t${extensions}\n\t\t<!--ENDSCHNIPSEL-->`,
			);
		} else {
			pluginXML = pluginXML.replace(
				/<\/extensions>/,
				`\t<!--SCHNIPSEL-->\n\t\t${extensions}\n\t\t<!--ENDSCHNIPSEL-->\n\t</extensions>`,
			);
		}
		await pluginXMLFile.write(pluginXML);

		this.debug("%o updated!", this.options.pluginXML);
	}

	async render(snippets: SnippetObject[]): Promise<RenderedSnippetFile[]> {
		const snippetFiles = await super.render(snippets, true);

		if (this.options.pluginXML) {
			this.tasks.push(this.updatePluginXML(snippetFiles));
		}

		await Promise.all(this.tasks);

		return snippetFiles;
	}
}

import { join } from "node:path";
import { readFile } from "node:fs/promises";

import chalk from "chalk";
import fm from "front-matter";
import { globby } from "globby";

import { debug, logger } from "./lib";
import { InputConfig, SnippetObject } from "./types";

export class Input {
	private _options: InputConfig;
	private _cwd: string;

	constructor(options: InputConfig, cwd = process.cwd()) {
		this._options = options;
		this._cwd = cwd;
	}

	private async _readSingle(path: string): Promise<SnippetObject | undefined> {
		const filePath = join(this._cwd, this._options.directory, path);
		const raw = await readFile(filePath, "utf8");

		const { attributes, body } = fm<Record<string, unknown>>(raw);

		const errors: string[] = [];

		["name", "description", "prefix"].forEach((key) => {
			if (!(key in attributes)) {
				errors.push(`${chalk.cyan(key)} is missing`);
			} else if (typeof attributes[key] !== "string") {
				errors.push(
					`${chalk.cyan(key)} should be of type ${chalk.cyan("string")}`,
				);
			}
		});
		if (!("scopes" in attributes)) {
			errors.push(`${chalk.cyan("scopes")} is missing`);
		} else if (!Array.isArray(attributes.scopes)) {
			errors.push(
				`${chalk.cyan("scopes")} should be of type ${chalk.cyan("string[]")}`,
			);
		}

		if (errors.length) {
			logger.warn(
				`Invalid snippet file ${chalk.cyan(
					path,
				)} (snippet will be ignored):\n\n- ${errors.join("\n- ")}`,
			);

			return;
		}

		return {
			name: attributes.name as string,
			description: attributes.description as string,
			scopes: attributes.scopes as string[],
			prefix: attributes.prefix as string,
			// Only keep code block content
			body: body.replace(/^.*?```\w*\n+/m, "").replace(/\n+```.*\n?$/m, ""),
		};
	}

	async read(): Promise<SnippetObject[]> {
		debug("Looking for snippet files...");
		const files = await globby(this._options.glob || "**/*.md", {
			cwd: join(this._cwd, this._options.directory),
		});
		debug("%o snippet files found!", files.length);

		debug("Reading snippet files...");
		const snippets = (
			await Promise.all(files.map((file) => this._readSingle(file)))
		).filter(Boolean) as SnippetObject[];
		debug("%o snippet files read!", snippets.length);

		return snippets;
	}
}

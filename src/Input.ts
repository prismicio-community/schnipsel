import { join } from "node:path";
import { readFile } from "node:fs/promises";

import chalk from "chalk";
import fm from "front-matter";
import { globby } from "globby";

import { debug, logger } from "./lib";
import { InputConfig } from "./types";

export class Input {
	private _options: InputConfig;
	private _cwd: string;

	constructor(options: InputConfig, cwd = process.cwd()) {
		this._options = options;
		this._cwd = cwd;
	}

	private async _readSingle(path: string) {
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
		if (!("scope" in attributes)) {
			errors.push(`${chalk.cyan("scope")} is missing`);
		} else if (
			typeof attributes.scope !== "string" &&
			!Array.isArray(attributes.scope)
		) {
			errors.push(
				`${chalk.cyan("scope")} should be of type ${chalk.cyan(
					"string | string[]",
				)}`,
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
			name: attributes.name,
			description: attributes.description,
			scope: Array.isArray(attributes.scope)
				? attributes.scope
				: [attributes.scope],
			prefix: attributes.prefix,
			// Only keep code block content
			body: body.replace(/^.*?```\w*\n+/m, "").replace(/\n+```.*\n?$/m, ""),
		};
	}

	async read() {
		debug("Looking for snippet files...");
		const files = await globby(this._options.glob || "**/*.md", {
			cwd: join(this._cwd, this._options.directory),
		});
		debug("%o snippet files found!", files.length);

		debug("Reading snippet files...");
		const snippets = (
			await Promise.all(files.map((file) => this._readSingle(file)))
		).filter(Boolean);
		debug("%o snippet files read!", snippets.length);

		return snippets;
	}
}

import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import detectIndent from "detect-indent";
import chalk from "chalk";

type JSONFileMeta = {
	indent: string;
};

export type JSONFileWithMeta<T = Record<string, unknown>> = {
	__meta?: JSONFileMeta;
} & T;

export class JSONFile<T = Record<string, unknown>> {
	protected _name: string;
	get name() {
		return this._name;
	}

	protected _cwd: string;
	get cwd() {
		return this._cwd;
	}

	protected _path: string;
	get path() {
		return this._path;
	}

	private _meta: JSONFileMeta;
	get meta() {
		return this._meta;
	}

	constructor(name: string, cwd = process.cwd()) {
		this._name = name;
		this._cwd = cwd;
		this._path = join(cwd, name);
		this._meta = { indent: "  " };
	}

	exists() {
		return existsSync(this.path);
	}

	read(): JSONFileWithMeta<T> {
		if (!this.exists()) {
			throw new Error(
				`${chalk.cyan(this.name)} not found in ${chalk.cyan(this.cwd)}`,
			);
		}

		const raw = readFileSync(this.path, "utf8");
		const indent = detectIndent(raw).indent || "  ";
		const json = JSON.parse(raw);

		this._meta = { indent };
		json.__meta = this._meta;

		return json;
	}

	write(json: JSONFileWithMeta<T>) {
		const { __meta: meta = this._meta, ...rest } = json;

		const raw = `${JSON.stringify(rest, undefined, meta.indent)}\n`;

		writeFileSync(this.path, raw);
	}
}

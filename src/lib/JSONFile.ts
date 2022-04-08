import { join } from "node:path";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

import detectIndent from "detect-indent";
import chalk from "chalk";

export type JSONFileMeta = {
	indent: string;
};

export type JSONFileWithMeta<T = Record<string, unknown>> = {
	__meta: JSONFileMeta;
} & T;

export class JSONFile<T = Record<string, unknown>> {
	private _name: string;
	get name() {
		return this._name;
	}

	private _cwd: string;
	get cwd() {
		return this._cwd;
	}

	private _path: string;
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

	async read(): Promise<JSONFileWithMeta<T>> {
		if (!this.exists()) {
			throw new Error(
				`${chalk.cyan(this.name)} not found in ${chalk.cyan(this.cwd)}`,
			);
		}

		const raw = await readFile(this.path, "utf8");
		const indent = detectIndent(raw).indent || "  ";
		const json = JSON.parse(raw);

		this._meta = { indent };
		json.__meta = this._meta;

		return json;
	}

	async readMeta(): Promise<JSONFileMeta> {
		return (await this.read()).__meta;
	}

	async write(json: JSONFileWithMeta<T>): Promise<void> {
		const { __meta: meta = this._meta, ...rest } = json;

		const raw = `${JSON.stringify(rest, undefined, meta.indent)}\n`;

		await writeFile(this.path, raw);
	}
}

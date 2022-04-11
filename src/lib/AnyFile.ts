import { join } from "node:path";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

import chalk from "chalk";

export abstract class AnyFile<T = string> {
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

	constructor(name: string, cwd = process.cwd()) {
		this._name = name;
		this._cwd = cwd;
		this._path = join(cwd, name);
	}

	exists() {
		return existsSync(this.path);
	}

	abstract read(): Promise<T>;
	protected async _read(): Promise<string> {
		if (!this.exists()) {
			throw new Error(
				`${chalk.cyan(this.name)} not found in ${chalk.cyan(this.cwd)}`,
			);
		}

		return await readFile(this.path, "utf8");
	}

	abstract write(body: T): Promise<void>;
	protected async _write(body: string): Promise<void> {
		await writeFile(this.path, body);
	}
}

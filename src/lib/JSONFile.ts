import detectIndent from "detect-indent";

import { AnyFile } from "./AnyFile";

export type JSONFileMeta = {
	indent: string;
};

export type JSONFileWithMeta<T = Record<string, unknown>> = {
	__meta: JSONFileMeta;
} & T;

export class JSONFile<T = Record<string, unknown>> extends AnyFile<T> {
	private _meta: JSONFileMeta;
	get meta() {
		return this._meta;
	}

	constructor(name: string, cwd = process.cwd()) {
		super(name, cwd);
		this._meta = { indent: "  " };
	}

	async read(): Promise<JSONFileWithMeta<T>> {
		const raw = await this._read();
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

		await this._write(raw);
	}
}

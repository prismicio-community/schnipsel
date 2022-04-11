import detectIndent from "detect-indent";

import { AnyFile } from "./AnyFile";

export type XMLFileMeta = {
	indent: string;
};

export class XMLFile extends AnyFile<string> {
	private _meta: XMLFileMeta;
	get meta() {
		return this._meta;
	}

	constructor(name: string, cwd = process.cwd()) {
		super(name, cwd);
		this._meta = { indent: "  " };
	}

	async read(): Promise<string> {
		const xml = await this._read();

		const indent = detectIndent(xml).indent || "  ";
		this._meta = { indent };

		return xml;
	}

	async readMeta(): Promise<XMLFileMeta> {
		await this.read();

		return this.meta;
	}

	async write(xml: string): Promise<void> {
		await this._write(xml.replace(/\t/g, this.meta.indent));
	}
}

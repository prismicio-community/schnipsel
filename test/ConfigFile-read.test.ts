import { join } from "node:path";

import { test, expect } from "vitest";

import validConfig from "./__fixtures__/valid/schnipsel.config";

import { ConfigFile } from "../src/ConfigFile";

test("returns valid config", async () => {
	const config = new ConfigFile(join(__dirname, "__fixtures__/valid"));

	expect(await config.read()).toEqual(validConfig);
});

test("throws invalid config", async () => {
	const config = new ConfigFile(join(__dirname, "__fixtures__/invalid"));

	await expect(() => config.read()).rejects.toThrowError(/^Invalid/);
});

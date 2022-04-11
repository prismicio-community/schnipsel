import { join } from "node:path";
import { writeFile } from "node:fs/promises";

import { test, expect, vi } from "vitest";

import validConfig from "./__fixtures__/valid/schnipsel.config";

import { readAndRender } from "../src/process";

vi.mock("../src/lib", async () => {
	const {
		logger,
		...rest
	}: Record<string, Record<string, unknown>> = await vi.importActual(
		"../src/lib",
	);

	return {
		logger: { ...logger, warn: vi.fn(), info: vi.fn(), success: vi.fn() },
		...rest,
	};
});

vi.mock("node:fs/promises", async () => {
	const { writeFile: _writeFile, ...rest }: Record<string, unknown> =
		await vi.importActual("node:fs/promises");

	return { writeFile: vi.fn(), ...rest };
});

test("reads and writes snippet files according to config", async () => {
	await readAndRender(validConfig, join(__dirname, "__fixtures__/valid"));

	expect(vi.mocked(writeFile)).toHaveBeenCalledTimes(
		2 /* VS Code */ +
			1 /* Sublime */ +
			1 /* IntelliJ */ +
			2 /* package.json + plugin.xml */,
	);
	expect(
		vi
			.mocked(writeFile)
			// @ts-expect-error - Apparently Vitest is messing types(?)
			.calls.map(([_, content]) => content)
			.sort()
			.join("\n\n\n"),
	).toMatchSnapshot();

	vi.mocked(writeFile).mockClear();
});

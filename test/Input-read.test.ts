import { test, expect, vi } from "vitest";

import chalk from "chalk";

import { logger } from "../src/lib";
import { Input } from "../src/Input";

chalk.level = 0;

vi.mock("../src/lib", async () => {
	const {
		logger,
		...rest
	}: Record<string, Record<string, unknown>> = await vi.importActual(
		"../src/lib",
	);

	return { logger: { ...logger, warn: vi.fn() }, ...rest };
});

test("reads input directory and warns about invalid files", async () => {
	const input = new Input({ directory: "__fixtures__/valid/src" }, __dirname);

	expect(await input.read()).toMatchSnapshot();
	expect(vi.mocked(logger.warn)).toHaveBeenCalledTimes(4);
	// @ts-expect-error - Apparently Vitest is messing types(?)
	expect(vi.mocked(logger.warn).calls).toMatchSnapshot();

	vi.mocked(logger.warn).mockRestore();
});

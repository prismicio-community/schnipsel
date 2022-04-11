import { join } from "node:path";

import chalk from "chalk";
import chokidar from "chokidar";

import { ConfigFile } from "./ConfigFile";
import { Input } from "./Input";
import { Renderers } from "./renderers";
import { logger } from "./lib";
import { SchnipselConfig } from "./types";

export const readAndRender = async (
	config: SchnipselConfig,
	cwd = process.cwd(),
) => {
	const now = Date.now();

	const input = new Input(config.input, cwd);
	const snippets = await input.read();

	logger.info(
		`Rendering ${chalk.cyan(snippets.length)} snippet${
			snippets.length > 1 ? "s" : ""
		} through ${chalk.cyan(config.renderers.length)} renderer${
			config.renderers.length > 1 ? "s" : ""
		}...`,
	);

	await Promise.all(
		config.renderers.map(async (renderer) =>
			new Renderers[renderer.name](renderer.options, cwd).render(snippets),
		),
	);

	logger.success(
		`Read and rendered snippets in ${chalk.cyan(`${Date.now() - now}ms`)}`,
	);
};

/**
 * Runs Schnipsel in the current working directory.
 *
 * @param config - The configuration to use, will default to the one available
 *   in the current working directory or throw if not available.
 * @param cwd - The current working directory.
 */
export const run = async (config: SchnipselConfig, cwd = process.cwd()) => {
	if (!config) {
		const configFile = new ConfigFile(cwd);
		config = await configFile.read();
	}

	await readAndRender(config, cwd);
};

/**
 * Runs Schnipsel in the current working directory and watch for changes
 *
 * @param config - The configuration to use, will default to the one available
 *   in the current working directory or throw if not available.
 * @param cwd - The current working directory.
 */
export const runWatch = async (
	config: SchnipselConfig,
	cwd = process.cwd(),
) => {
	if (!config) {
		const configFile = new ConfigFile(cwd);
		config = await configFile.read();
	}

	const handler = async () => {
		console.clear();
		const now = new Date();
		logger.info(
			`Changes detected, rendering... (${chalk.cyan(
				`${`00${now.getHours()}`.slice(-2)}:${`00${now.getMinutes()}`.slice(
					-2,
				)}:${`00${now.getSeconds()}`.slice(-2)}`,
			)})`,
		);
		await readAndRender(config, cwd);
	};

	chokidar
		.watch("**/*.md", {
			cwd: join(process.cwd(), config.input.directory),
			persistent: true,
		})
		.on("change", handler)
		.on("unlink", handler)
		.on("ready", handler);
};

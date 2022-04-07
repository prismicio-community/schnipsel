import { join } from "node:path";

import chalk from "chalk";
import chokidar from "chokidar";

import { logger } from "./lib";
import { ConfigFile } from "./ConfigFile";
import { Input } from "./Input";
import { Config } from "./types";

export const readAndRender = async (config: Config) => {
	const input = new Input(config.input);
	const snippets = await input.read();

	logger.info(
		`Rendering ${chalk.cyan(snippets.length)} snippet${
			snippets.length > 1 ? "s" : ""
		} through ${chalk.cyan(config.renderers.length)} renderer${
			config.renderers.length > 1 ? "s" : ""
		}...`,
	);
};

export const run = async () => {
	const configFile = new ConfigFile();
	const config = configFile.read();

	await readAndRender(config);
};

export const runWatch = async () => {
	const configFile = new ConfigFile();
	const config = configFile.read();

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
		await readAndRender(config);
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

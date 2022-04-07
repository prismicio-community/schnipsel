import chalk from "chalk";

import { JSONFile, JSONFileWithMeta, debug } from "./lib";
import { CONFIG_FILE, NAME } from "./const";
import { Config } from "./types";

export class ConfigFile extends JSONFile<Config> {
	constructor(cwd = process.cwd()) {
		super(CONFIG_FILE, cwd);
	}

	init() {
		if (this.exists()) {
			throw new Error(
				`${chalk.cyan(CONFIG_FILE)} already exists in ${chalk.cyan(this.cwd)}`,
			);
		}

		this.write({
			__meta: new JSONFile("package.json", this.cwd).meta,
			input: {
				directory: "src",
			},
			renderers: [],
		});
	}

	read() {
		debug("Reading config file...");

		if (!this.exists()) {
			throw new Error(
				`${chalk.cyan(CONFIG_FILE)} not found in ${chalk.cyan(
					this.cwd,
				)}, create one with ${chalk.cyan(`${NAME} init`)}`,
			);
		}

		const config = super.read();

		this.validate(config);

		debug("Config file read and validated!");

		return config;
	}

	validate(maybeConfig: JSONFileWithMeta): asserts maybeConfig is Config {
		const errors: string[] = [];

		// Validate `input`
		if (!("input" in maybeConfig)) {
			errors.push(`${chalk.cyan("input")} is missing`);
		} else if (!maybeConfig.input || typeof maybeConfig.input !== "object") {
			errors.push(
				`${chalk.cyan("input")} should be of type ${chalk.cyan("object")}`,
			);
		} else {
			const input = maybeConfig.input as Record<string, unknown>;

			// Validate `input.directory`
			if (!("directory" in input)) {
				errors.push(`${chalk.cyan("input.directory")} is missing`);
			} else if (typeof input.directory !== "string") {
				errors.push(
					`${chalk.cyan("input.directory")} should be of type ${chalk.cyan(
						"string",
					)}`,
				);
			}

			// Validate `input.glob`
			if (
				"glob" in input &&
				typeof input.glob !== "string" &&
				!(
					Array.isArray(input.glob) &&
					input.glob.length > 0 &&
					input.glob.every((g) => typeof g === "string")
				)
			) {
				errors.push(
					`${chalk.cyan("input.glob")} should be of type ${chalk.cyan(
						"string | string[]",
					)}`,
				);
			}
		}

		if (!("renderers" in maybeConfig)) {
			errors.push(`${chalk.cyan("renderers")} is missing`);
		} else if (!Array.isArray(maybeConfig.renderers)) {
			errors.push(
				`${chalk.cyan("renderers")} should be of type ${chalk.cyan("array")}`,
			);
		} else if (maybeConfig.renderers.length === 0) {
			errors.push(`${chalk.cyan("renderers")} should not be empty`);
		}

		if (errors.length) {
			throw new Error(
				`Invalid ${chalk.cyan(CONFIG_FILE)} at ${chalk.cyan(
					this.cwd,
				)}:\n\n- ${errors.join("\n- ")}`,
			);
		}
	}
}

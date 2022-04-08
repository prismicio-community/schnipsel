import chalk from "chalk";

import { JSONFile, JSONFileWithMeta, debug } from "./lib";
import { CONFIG_FILE, NAME } from "./const";
import { Config } from "./types";
import { Renderers } from "./renderers";

export class ConfigFile extends JSONFile<Config> {
	constructor(cwd = process.cwd()) {
		super(CONFIG_FILE, cwd);
	}

	async init(): Promise<void> {
		if (this.exists()) {
			throw new Error(
				`${chalk.cyan(CONFIG_FILE)} already exists in ${chalk.cyan(this.cwd)}`,
			);
		}

		await this.write({
			__meta: await new JSONFile("package.json", this.cwd).readMeta(),
			input: {
				directory: "src",
			},
			renderers: [],
		});
	}

	async read(): Promise<JSONFileWithMeta<Config>> {
		debug("Reading config file...");

		if (!this.exists()) {
			throw new Error(
				`${chalk.cyan(CONFIG_FILE)} not found in ${chalk.cyan(
					this.cwd,
				)}, create one with ${chalk.cyan(`${NAME} init`)}`,
			);
		}

		const config = await super.read();

		this.validate(config);

		debug("Config file read and validated!");

		return config;
	}

	validate(
		maybeConfig: JSONFileWithMeta,
	): asserts maybeConfig is JSONFileWithMeta<Config> {
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
		} else if (
			maybeConfig.renderers.some(
				(renderer) => !renderer || typeof renderer !== "object",
			)
		) {
			errors.push(
				`All ${chalk.cyan("renderers[n]")} should be of type ${chalk.cyan(
					"object",
				)}`,
			);
		} else {
			if (maybeConfig.renderers.some((renderer) => !("name" in renderer))) {
				errors.push(`Some ${chalk.cyan("renderers[n].name")} are missing`);
			} else if (
				maybeConfig.renderers.some(
					(renderer) => typeof renderer.name !== "string",
				)
			) {
				errors.push(
					`All ${chalk.cyan(
						"renderers[n].name",
					)} should be of type ${chalk.cyan("string")}`,
				);
			} else if (
				maybeConfig.renderers.some(
					(renderer) => !Object.keys(Renderers).includes(renderer.name),
				)
			) {
				errors.push(
					`All ${chalk.cyan(
						"renderers[n].name",
					)} should be of type ${chalk.cyan(
						Object.keys(Renderers)
							.map((name) => `"${name}"`)
							.join(" | "),
					)}`,
				);
			}

			if (maybeConfig.renderers.some((renderer) => !("options" in renderer))) {
				errors.push(`Some ${chalk.cyan("renderers[n].options")} are missing`);
			} else if (
				maybeConfig.renderers.some(
					(renderer) =>
						!renderer.options || typeof renderer.options !== "object",
				)
			) {
				errors.push(
					`All ${chalk.cyan(
						"renderers[n].options",
					)} should be of type ${chalk.cyan("object")}`,
				);
			} else {
				if (
					maybeConfig.renderers.some(
						(renderer) => !("outputDirectory" in renderer.options),
					)
				) {
					errors.push(
						`Some ${chalk.cyan(
							"renderers[n].options.outputDirectory",
						)} are missing`,
					);
				} else if (
					maybeConfig.renderers.some(
						(renderer) => typeof renderer.options.outputDirectory !== "string",
					)
				) {
					errors.push(
						`All ${chalk.cyan(
							"renderers[n].options.outputDirectory",
						)} should be of type ${chalk.cyan("string")}`,
					);
				}
			}
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

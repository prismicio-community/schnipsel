import cac from "cac";
import chalk from "chalk";
import exit from "exit";
import latestVersion from "latest-version";
import semver from "semver";

import * as commands from "./commands";
import { NAME, PACKAGE, VERSION, CONFIG_FILE } from "./const";
import { lineBreak, logger } from "./lib";

const cli = cac(NAME);

cli
	.command(
		"",
		`Render Schnipsel project according to current working directory ${chalk.cyan(
			CONFIG_FILE,
		)}`,
		{ allowUnknownOptions: false },
	)
	.option("-w, --watch", "Render in watch mode")
	.action(async (options) => {
		await commands._default(cli, options);
	});

cli
	.command("init", `Init a ${chalk.cyan(CONFIG_FILE)} file`, {
		allowUnknownOptions: false,
	})
	.action(async (options) => {
		await commands.init(cli, options);
	});

cli.version(VERSION);
cli.help(commands.help);

const run = async (): Promise<void> => {
	try {
		cli.parse(process.argv, { run: false });
		await cli.runMatchedCommand();
	} catch (error) {
		if (error instanceof Error) {
			logger.error(error.message);
		} else {
			logger.fatal("");
			console.log(error);
			lineBreak();
		}
		exit(1);
	}

	try {
		const version = await latestVersion(PACKAGE);
		if (semver.gt(version, VERSION)) {
			lineBreak();
			logger.info(
				`A new version of ${chalk.cyan(
					PACKAGE,
				)} is available!\n\n  Install it with:\n  $ npm install --global ${PACKAGE}@${version}\n`,
			);
		}
	} catch (error) {
		// Ignore
	}
};

process.on("unhandledRejection", (error) => {
	logger.fatal("");
	console.log(error);
	lineBreak();
	exit(2);
});

run();

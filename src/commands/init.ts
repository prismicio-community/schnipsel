import { CAC } from "cac";
import chalk from "chalk";

import { lineBreak, logger } from "../lib";
import { CONFIG_FILE } from "../const";
import { ConfigFile } from "../ConfigFile";

export const init = async (
	_cli: CAC,
	_options: { [key: string]: unknown },
): Promise<void> => {
	const configFile = new ConfigFile();
	configFile.init();

	lineBreak();
	logger.success(`Created ${chalk.cyan(CONFIG_FILE)}`);
};

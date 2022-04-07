import { CAC } from "cac";

import * as process from "../process";

export const _default = async (
	_cli: CAC,
	options: { watch?: boolean; [key: string]: unknown },
): Promise<void> => {
	if (options.watch) {
		await process.runWatch();
	} else {
		await process.run();
	}
};

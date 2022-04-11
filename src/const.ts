import {
	name as pkgName,
	description as pkgDescription,
	version as pkgVersion,
} from "../package.json";

export const NAME = pkgName;
export const PACKAGE = pkgName;
export const DESCRIPTION = pkgDescription;
export const VERSION = pkgVersion;
export const CONFIG_FILE = `${NAME}.config.ts`;

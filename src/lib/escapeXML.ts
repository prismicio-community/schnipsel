export const escapeXML = (str: string): string => {
	const regexMagic = /(\$)([a-z(]+)([^$])/gi;

	return str.replace(regexMagic, "\\$1$2$3");
};

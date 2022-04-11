<!--

TODO: Go through all "TODO" comments in the project

TODO: Replace all on all files (README.md, CONTRIBUTING.md, bug_report.md, package.json):
- schnipsel
- Write snippets once, render them for many IDEs
- prismicio-community/schnipsel
- schnipsel

-->

# Schnipsel

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Conventional Commits][conventional-commits-src]][conventional-commits-href]
[![License][license-src]][license-href]

<!-- TODO: Replacing link to Prismic with [Prismic][prismic] is useful here -->

Write snippets once, render them for many IDEs.

<!--

TODO: Create a small list of package features:

- 🤔 &nbsp;A useful feature;
- 🥴 &nbsp;Another useful feature;
- 🙃 &nbsp;A final useful feature.

Non-breaking space: &nbsp; are here on purpose to fix emoji rendering on certain systems.

-->

- ✍ &nbsp;Write snippets once in MarkDown;
- 🚀 &nbsp;Render them to many IDEs format (VS Code, Vim, Sublime, IntelliJ);
- ⚙ &nbsp;Flexible and typed configuration.

## Install

```bash
npm install schnipsel
```

## Documentation

Schnipsel is a [CLI](#schnipsel-cli).

It reads configuration from a [`schnipsel.config.ts` file](#schnipselconfigts) to renders [input snippets](#snippet-file-format) to desired IDE formats.

### `schnipsel` CLI

```bash
# Render project
schnipsel

# Render project in watch mode
schnipsel --watch
schnipsel -w

# Init a schnipsel.config.ts file
schnipsel init

# Display help
schnipsel --help
schnipsel -h

# Display version
schnipsel --version
schnipsel -v
```

### `schnipsel.config.ts`

```typescript
import { defineSchnipselConfig } from "schnipsel";

export default defineSchnipselConfig({
	/**
	 * Configures where and how Schnipsel should look for input files.
	 */
	input: {
		/**
		 * Base directory where to look for input files, typically `./src`.
		 */
		directory: "src",

		/**
		 * An optional glob or glob array to match input files in `directory`.
		 *
		 * See Globby `patterns` parameter: https://github.com/sindresorhus/globby#patterns
		 */
		glob: "**/*.md",
	},

	/**
	 * Configures renderers that should be applied to found input files.
	 */
	renderers: [
		{
			/**
			 * Name of the renderer.
			 * 
			 * Available:
			 * 
			 * visualstudiocode, vscode, vim
			 * sublimetext, sublime
			 * intellijidea, intellij
			 */
			name: "vscode",

			/**
			 * Options to pass to the renderer.
			 */
			options: {
				/**
				 * Output directory where to write rendered snippets.
				 */
				outputDirectory: "vscode/snippets",

				/**
				 * An optional map mapping input file paths from CWD to output file paths to
				 * copy after render.
				 */
				passthroughFileCopy: {
					/**
					 * Will copy the `./README.md` to `./vscode/snippets/README.md`
					 */
					"./README.md": "./vscode/README.md",
				},

				/**
				 * A map mapping input scopes to output scopes or a function receiving an
				 * input scope and returning an output scope.
				 *
				 * See default scope resolver in: https://github.com/prismicio-community/schnipsel/src/renderers/scopeResolver.ts
				 */
				scopeResolver: {
					/**
					 * Snippet featuring the `xml` scope will render with the `text.xml` scope
					 * for this renderer.
					 */
					xml: "text.xml"
				},

				// Only for VSCode renderer.

				/**
				 * An optional path to a `package.json` file where to write the
				 * `contributes.snippets` map of Visual Studio Code extensions.
				 */
				packageJSON: "vscode/package.json",

				// Only for IntelliJ renderer.

				/**
				 * An optional path to a `plugin.xml` file where to write the `<extensions />`
				 * default live templates of an IntelliJ IDEA plugin.
				 */
				pluginXML: "intellij/src/main/resources/META-INF/plugin.xml",
			},
		},
	],
});
```

For more information about Schnipsel configuration, see [src/types.ts](src/types.ts).

### Snippet file format

````markdown
---
name: "Hello World"
description: "Says hello to the world"
scopes: ["typescript"] # Scope(s) of the snippet. Uses VS Code's by default.
prefix: "helloWorld" # What triggers the snippet to be suggested
---

<!--

A code block, everything inside will be the snippet content.

Use `${1}` to define a tab stop.
Use `${2:defaultValue}` to define a tab stop with a default value.

-->

```typescript
export const hello${1:World} = (): void => {
	console.info("Hello ${1:World}!");
};
```
````

### Recommended project structure

See [prismicio/prismic-snippets](https://github.com/prismicio/prismic-snippets) for an example project structure rendering and shipping snippets to multiple IDEs at once.

---

To discover what's new on this package check out [the changelog][changelog]. 

## Contributing

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Prismic developer community!

**Asking a question**: [Open an issue][repo-bug-report] explaining what you want to achieve / your question. A maintainer will get back to you shortly.

**Reporting a bug**: [Open an issue][repo-bug-report] explaining your application's setup and the bug you're encountering.

**Suggesting an improvement**: [Open an issue][repo-feature-request] explaining your improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes, feel free to [open a pull request][repo-pull-requests] with a description of your changes. For large changes, please first [open an issue][repo-feature-request] so we can discuss if and how the changes should be implemented.

For more clarity on this project and its structure you can also check out the detailed [CONTRIBUTING.md][contributing] document.

## License

```
   Copyright 2013-2022 Prismic <contact@prismic.io> (https://prismic.io)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

<!-- Links -->

[prismic]: https://prismic.io

<!-- TODO: Replace link with a more useful one if available -->

[prismic-docs]: https://prismic.io/docs
[changelog]: ./CHANGELOG.md
[contributing]: ./CONTRIBUTING.md

<!-- TODO: Replace link with a more useful one if available -->

[forum-question]: https://community.prismic.io
[repo-bug-report]: https://github.com/prismicio-community/schnipsel/issues/new?assignees=&labels=bug&template=bug_report.md&title=
[repo-feature-request]: https://github.com/prismicio-community/schnipsel/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=
[repo-pull-requests]: https://github.com/prismicio-community/schnipsel/pulls

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/schnipsel/latest.svg
[npm-version-href]: https://npmjs.com/package/schnipsel
[npm-downloads-src]: https://img.shields.io/npm/dm/schnipsel.svg
[npm-downloads-href]: https://npmjs.com/package/schnipsel
[github-actions-ci-src]: https://github.com/prismicio-community/schnipsel/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/prismicio-community/schnipsel/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/github/prismicio-community/schnipsel.svg
[codecov-href]: https://codecov.io/gh/prismicio-community/schnipsel
[conventional-commits-src]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional-commits-href]: https://conventionalcommits.org
[license-src]: https://img.shields.io/npm/l/schnipsel.svg
[license-href]: https://npmjs.com/package/schnipsel

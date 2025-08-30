# 🎨 Picolight

[![GitHub Action](https://img.shields.io/github/actions/workflow/status/raviqqe/picolight/test.yaml?branch=main&style=flat-square)](https://github.com/raviqqe/picolight/actions)
[![npm](https://img.shields.io/npm/v/picolight?style=flat-square)](https://www.npmjs.com/package/picolight)
[![License](https://img.shields.io/github/license/raviqqe/picolight.svg?style=flat-square)][license]

The tiny syntax highlighting library for dynamic input.

Its core library has only 0.5 KB JavaScript!

## Install

```sh
npm install picolight
```

## Usage

```typescript
import { highlight } from "picolight";
import { scheme } from "picolight/languages/scheme";
import { githubDark } from "picolight/themes/github-dark";

const code = document.querySelector("code");

code.innerHTML = highlight(
  `(write-string "Hello, world!\\n")`,
  scheme,
  githubDark,
).outerHTML;
```

## Supported languages

- [Scheme](https://scheme.org)
- [TypeScript](https://www.typescriptlang.org/)
- Other languages might be coming, maybe...

## Supported themes

We support [all TextMate themes provided by Shiki](https://shiki.matsu.io/themes).

## License

[MIT][license]

[license]: https://github.com/raviqqe/picolight/blob/main/LICENSE

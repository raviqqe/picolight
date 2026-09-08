# 🎨 Picolight

[![GitHub Action](https://img.shields.io/github/actions/workflow/status/raviqqe/picolight/test.yaml?branch=main&style=flat-square)](https://github.com/raviqqe/picolight/actions)
[![npm](https://img.shields.io/npm/v/picolight?style=flat-square)](https://www.npmjs.com/package/picolight)
[![License](https://img.shields.io/github/license/raviqqe/picolight.svg?style=flat-square)][license]

The tiny syntax highlighting library for dynamic input.

Its core library costs only 1 KB JavaScript!

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

code.innerHTML = highlight(`(write-string "Hello, world!\\n")`, scheme, githubDark).outerHTML;
```

## Supported languages

We support [all TextMate languages provided by Shiki](https://shiki.style/languages).

Hand-written lexers for [Scheme](https://scheme.org) and [TypeScript](https://www.typescriptlang.org/) are also available under `picolight/languages/classic/`.

## Supported themes

We support [all TextMate themes provided by Shiki](https://shiki.style/themes).

## License

[MIT][license]

[license]: https://github.com/raviqqe/picolight/blob/main/LICENSE

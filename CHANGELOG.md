# Changelog

## v0.0.11 - 2021-10-21

### New

- Upgrade observablehq runtime and stdlib. Includes SQLite file attachment support.

## v0.0.10 - 2021-07-11

### New

- Shebang support (`#!/usr/bin/env dataflow run`) for `.ojs` files.

## v0.0.9 - 2021-05-22

### Fixed

- Fix a bug where the `width` builtin cell in `dataflow run` erronously updated when the value had not changed.

## v0.0.8 - 2021-05-20

### Fixed

- `dataflow run` on https sites (websocket uses `wss://` instead of `ws://`)

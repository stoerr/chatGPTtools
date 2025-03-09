#!/usr/bin/env bash
set -x
time aigenpipeline -m "o3-mini" -p prompt.md -upd -o bookmarkletmaker.html ../index.html

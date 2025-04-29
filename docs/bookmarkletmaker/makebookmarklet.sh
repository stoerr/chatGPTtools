#!/usr/bin/env bash
cd $(dirname "$0") || exit 3
cd ..
set -x
time chatgpt -m o4-mini -ocf ../exampleactions/chatgptpmcodev.cfg -pf bookmarkletmaker/prompt.md -f index.html -fo bookmarkletmaker/bookmarkletmaker.html

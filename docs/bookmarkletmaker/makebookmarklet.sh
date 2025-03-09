#!/usr/bin/env bash
cd $(dirname "$0") || exit 3
cd ..
chatgpt -m o3-mini -ocf ../exampleactions/chatgptpmcodev.cfg -pf bookmarkletmaker/prompt.md

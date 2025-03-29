#!/usr/bin/env bash
# Plugin Action: duplicates the arguments
# Just for testing purposes

if [ "$1" = "--openaitoolsconfig" ]; then
    cat "$(dirname "$0")/duplicate.json"
    exit 0
fi

echo "$* $*"

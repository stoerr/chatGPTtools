#!/usr/bin/env bash

show_usage() {
  cat <<EOF
Usage:
  $(basename $0) [false|true] dirname
    lists the contents of the given directory, either recursively (if true is given) or not recursively
  $(basename $0) -h
    prints this help message
  $(basename $0) --openaitoolsconfig
    prints the OpenAI tools configuration usable with this script to use it as a tool in the chatgpt script
EOF
}

show_openaitoolsconfig() {
  cat <<EOF
  {
    "function": {
      "name": "$(basename $0 | tr -cd 'a-zA-Z0-9_-')",
      "description": "Lists the files in the given directory, if requested recursively. Result of 'ls -1F' or 'ls -1FR'",
      "parameters": {
        "type": "object",
        "properties": {
          "dirname": {
            "type": "string",
            "description": "relative path to the file to read wrt the current working directory - it's not allowed to read files outside of the current working directory"
          },
          "recursively": {
            "type": "boolean",
            "description": "If true the files will be listed recursively (including subdirectories), if false only the files of that directory will be listed."
          }
        },
        "required": [ "dirname",  "recursively" ],
        "additionalProperties": false
      },
      "strict": true
    },
    "commandline": [ "$0", "\recursively", "\$dirname" ],
    "stdin": ""
  }
EOF
}

if [ "$1" = "--openaitoolsconfig" ]; then show_openaitoolsconfig; exit 0; fi
if [ "$1" = "-h" ] || [ "$1" = "--help" ] || [ $# != 2 ]; then show_usage; exit 0; fi

dirname="$2"

# check that the dirname is within the current working directory, not a absolute path or relative path that goes outside
# the current working directory

abscurdir=$(realpath .)/
absfilepath=$(realpath "$dirname")/
# absfilepath should start with abscurdir
if [[ $absfilepath != $abscurdir* ]]; then
  echo "Error: The file is not within the current working directory" >&2
  exit 1
fi

if [ "$1" == "true" ]; then
  /bin/ls -1FR $dirname
else
  /bin/ls -1F $dirname
fi

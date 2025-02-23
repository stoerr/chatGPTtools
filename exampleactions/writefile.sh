#!/usr/bin/env bash

show_usage() {
  cat <<EOF
Usage:
  $(basename $0) filename
    writes stdin to the given file in the current directory or below
  $(basename $0) -h
    prints this help message
  $(basename $0) --openaitoolsconfig
    prints the OpenAI tools configuration usable with this script to use it as a tool in the chatgpt script
EOF
}

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then show_usage; exit 0; fi

show_openaitoolsconfig() {
  cat <<EOF
  {
    "function": {
      "name": "$(basename $0 | tr -cd 'a-zA-Z0-9_-')",
      "description": "Overwrites the named file with the given content.",
      "parameters": {
        "type": "object",
        "properties": {
          "filename": {
            "type": "string",
            "description": "relative path to the file to write wrt the current working directory - it's not allowed to write files outside of the current working directory"
          },
          "content": {
            "type": "string",
            "description": "The content the file will be overwritten with"
          }
        },
        "required": [ "filename", "content" ],
        "additionalProperties": false
      },
      "strict": true
    },
    "commandline": [ "$0", "\$filename" ],
    "stdin": "\$content"
  }
EOF
}

if [ "$1" = "--openaitoolsconfig" ]; then show_openaitoolsconfig; exit 0; fi

filename="$1"

# check that the filename is within the current working directory, not a absolute path or relative path that goes outside
# the current working directory

abscurdir=$(realpath .)/
absfiledir=$(realpath $(dirname "$filename"))/
# absfiledir should start with abscurdir
if [[ $absfiledir != $abscurdir* ]]; then
  echo "Error: The file is not within the current working directory" >&2
  exit 1
fi

echo "Writing to file: $filename" >&2

cat > "$filename"

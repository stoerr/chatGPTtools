#!/usr/bin/env bash

MAX_SIZE_BYTES=10000

show_usage() {
  cat <<EOF
Usage:
  $(basename $0) filename
    prints the contents of the given file from the current directory or below
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
      "description": "Reads the contents of the given file. Files above $MAX_SIZE_BYTES bytes will be truncated.",
      "parameters": {
        "type": "object",
        "properties": {
          "filename": {
            "type": "string",
            "description": "relative path to the file to read wrt the current working directory - it's not allowed to read files outside of the current working directory"
          }
        },
        "required": [ "filename" ],
        "additionalProperties": false
      },
      "strict": true
    },
    "commandline": [ "$0", "\$filename" ],
    "stdin": ""
  }
EOF
}

if [ "$1" = "--openaitoolsconfig" ]; then show_openaitoolsconfig; exit 0; fi

filename="$1"

# check that the filename is within the current working directory, not a absolute path or relative path that goes outside
# the current working directory

abscurdir=$(realpath .)/
absfilepath=$(realpath "$filename")
# absfilepath should start with abscurdir
if [[ $absfilepath != $abscurdir* ]]; then
  echo "Error: The file is not within the current working directory" >&2
  exit 1
fi

echo "Reading file: $filename" >&2

head -c "$MAX_SIZE_BYTES" "$filename"

# if file has $MAX_SIZE_BYTES bytes print a message
filesize=$(stat -c %s "$filename")
if [ $filesize -gt $MAX_SIZE_BYTES ]; then
  echo "... (truncated) ..."
  echo "CAUTION: File $filename is larger than $MAX_SIZE_BYTES bytes and was truncated."
  echo "CAUTION: File $filename is larger than $MAX_SIZE_BYTES bytes and was truncated." >&2
fi

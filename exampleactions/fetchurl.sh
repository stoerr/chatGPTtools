#!/usr/bin/env bash

show_usage() {
  cat <<EOF
Usage: $(basename $0) [--openaitoolsconfig] [-h] url
  where url is the URL to fetch as text
  -h, --help           Print this help message
  --openaitoolsconfig  Print the OpenAI tools configuration usable with this script to use it as a tool in the chatgpt script
EOF
}

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then show_usage; exit 0; fi

show_openaitoolsconfig() {
  cat <<EOF
  {
    "function": {
      "name": "$(basename $0 | tr -cd 'a-zA-Z0-9_-')",
      "description": "Reads the text content of a given URL.",
      "parameters": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "description": "The url to fetch, http or https"
          }
        },
        "required": [ "url" ],
        "additionalProperties": false
      },
      "strict": true
    },
    "commandline": [ "$0", "\$url" ],
    "stdin": ""
  }
EOF
}

if [ "$1" = "--openaitoolsconfig" ]; then show_openaitoolsconfig; exit 0; fi

url="$1"
echo "Fetching URL: $url" >&2

# This just outputs the plain HTML, which is often very long and hard to parse:
# curl -sSL "$url"

# This converts the HTML to markdown, which is often easier to read and much shorter.
# pandoc -f html -t markdown "$url"

pandoc -f html -t markdown "$url"


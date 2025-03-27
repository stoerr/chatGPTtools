#!/usr/bin/env bash
# Adds a nice pattern from Anthropic Claude https://www.anthropic.com/engineering/claude-think-tool :
# a tool that does nothing, just receive a thought the model can write if it thinks it needs some clarifying
# by a thought process before writing the actual output.
# This might need adaptation of the prompt to use it - see the cited link.
# (It do write the thought to stderr since it might be interesting, but it's not part of the real output)
# That is at times an easy way to improve the output quality.
# Thanks to
show_usage() {
  cat <<EOF
Pseudo tool to enable the AI having some internal thoughts before actually doing / outputting someting.
Writes the thought to stdout
Usage:
  $(basename $0)
    writes stdin to stderr
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
      "name": "think",
      "description": "Use this tool to think about something. It will not obtain new information or make anz changes, but just record the thought. Use it when complex reasoning or brain brainstorming is needed. For example if there are several unique ways to solve the task you are given, call this tool to discuss and decide between them and assess which of the ways is likely the simplest and most effective.",
      "parameters": {
        "type": "object",
        "properties": {
          "thought": {
            "type": "string",
            "description": "Your thoughts."
          }
        },
        "required": [ "thought"],
        "additionalProperties": false
      },
      "strict": true
    },
    "commandline": [ "$0" ],
    "stdin": "\$thought"
  }
EOF
}

if [ "$1" = "--openaitoolsconfig" ]; then show_openaitoolsconfig; exit 0; fi

# copy stdin to stderr
echo "Thought:" >&2
cat >&2
echo >&2

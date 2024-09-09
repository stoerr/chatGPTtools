#!/usr/bin/env bash
# if no arguments or -h or -? or --help, then print help
if [ $# -eq 0 ] || [ "$1" = "-h" ] || [ "$1" = "-?" ] || [ "$1" = "--help" ]; then
    echo "Usage: $0 prompt"
    echo "  where the prompt is what the LLM should do. It has the capability to retrieve URL content."
    exit 1
fi

prompt="$*"

# This doesn't execute the call but prints the response for debugging purposes
# chatgpt -v -o tool_choice=required -of tools=geturl-tool.json -s "Use the tool to retrieve URLs relevant to the users prompt." -p "$prompt"

# This actually executes the tools call
chatgpt -tf browseconfig.json -p "$prompt"


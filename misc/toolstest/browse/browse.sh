#!/usr/bin/env bash
# if no arguments or -h or -? or --help, then print help
if [ "$1" = "-h" ] || [ "$1" = "-?" ] || [ "$1" = "--help" ]; then
    echo "Usage: $0 prompt"
    echo "  where the prompt is what the LLM should do. It has the capability to retrieve URL content."
    exit 1
fi

prompt="$*"

# example: ./browse.sh read www.stoerr.net and find out what the URL of the artificial intelligence section is and read that section and collect the urls of the pro
           #jects there

# This doesn't execute the call but prints the response for debugging purposes
# chatgpt -v -o tool_choice=required -of tools=geturl-tool.json -s "Use the tool to retrieve URLs relevant to the users prompt." -p "$prompt"

# This actually executes the tools call
# chatgpt -cr -tf browseconfig.json -cf log.json "$prompt"

# chatgpt -cr -tf browseconfig.json -tf ../dup/duplicate.json "$prompt"

# chatgpt -tf browseconfig.json -tf ../dup/duplicate.json "read https://www.stoerr.net/contact.html and use tool duplicate to duplicate the text"

chatgpt -tf browseconfig.json -ts ../dup/duplicate.sh "read https://www.stoerr.net/contact.html and use tool duplicate to duplicate the text"

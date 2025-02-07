#!/usr/bin/env bash
# if no arguments or -h or -? or --help, then print help
if [ "$1" = "-h" ] || [ "$1" = "-?" ] || [ "$1" = "--help" ]; then
    echo "Usage: $0 prompt"
    echo "  where the prompt is what the LLM should do. It has the capability to retrieve URL content."
    exit 1
fi

prompt="$*"

chatgpt -ocf ../browse/browseopt.txt "read https://www.stoerr.net/contact.html and use tool duplicate to duplicate the text"

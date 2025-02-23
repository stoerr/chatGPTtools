# Example actions you can have triggered from the `chatgpt` script

The main script [chatgpt](../bin/chatgpt) can execute prompts using AI triggered actions or execute a chat where you
tell the AI to trigger actions. In addition to the actual prompts and other arguments you can give arbitrarily many
`-ts scriptname` arguments that serve as actions ("tool script"). The AI needs a description what the tools can do
and what arguments they have. The convention for that is that they should print that description when called with the
single parameter `--openaitoolsconfig` to stdout.

A tools config file contains a tool definition or an array of tool definitions:
{"function":{"name":...,"description:"...", "parameters":..., "strict":...}, "commandline: [...], "stdin": ...}.
The commandline array is used to call the tool, and stdin is the input for the tool.
In the command line array and stdin, $args is replaced by the arguments given to the tool, and $toolcall is replaced by
the tool call JSON. In the case of a toolscript: if there is no commandline or stdin given, the script is just called
with the tool call JSON.

An example of a tool definition is as follows (from the [fetchurl.sh](fetchurl.sh) script):

```json
  {
    "function": {
      "name": "fetchurl",
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
    "commandline": [ "./fetchurl.sh", "$url" ],
    "stdin": ""
  }
  ```

This is a tool description corresponding to 
[OpenAI function calling](https://platform.openai.com/docs/guides/function-calling)
with the `commandline` and `stdin` as optional extension: the `commandline` array is used to call the tool, and 
`stdin` is the input for the tool. Placehoders like `$url` are replaced by the corresponding argument. If these are
missing, the JSON arguments OpenAI passes in the toolcall are just passed to the script in stdin.

Example to use the tool with the scripts in this directory:

```bash
chatgpt -ts listfiles.sh -ts readfile.sh -ts writefile.sh "Read all .sh files in the current directory and write a file actions.txt with a short descript
ion"
```

Or use the configuration file

```bash
chatgpt -ocf chatgptpmcodev.cfg
```

The [chatgptpmcodev](../bin/chatgptpmcodev) script does that for you, and adds the arguments to the chatgpt command line.
To have a chat you can add the `-cr` option to the command line.

## Example actions in this directory

1. fetchurl.sh
   - Description: Fetches the text content of a given URL.

2. listfiles.sh
   - Description: Lists the contents of the given directory, either recursively or not.

3. readfile.sh
   - Description: Reads the contents of a given file from the current directory or below (truncated if larger than 10,000 bytes).

4. writefile.sh
   - Description: Overwrites the specified file with content from stdin.

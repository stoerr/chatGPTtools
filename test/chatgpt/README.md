# Atomatic tests for the chatgpt script

Here are some automated tests for the chatgpt script. It just runs a couple of command lines and checks whether the
result contains key phrases and whether the exit code is 0. We use the real OpenAI API for those tests, so that
does cost a little bit of money and is hand run once in a while.
This uses the [Bats (Bash Automated Testing System)](https://bats-core.readthedocs.io/en/stable/).

As a side effect this can be used to investigate what capabilities other models / APIs have - the script can also be
used to use local models, Claude, Azure AI Foundry models, Gemini etc. as long as they provide an API mostly
compatible to OpenAI's chat completion API. That needs profiles to be set up and be added to the command line -
I personally have e.g. profiles claude, gemini, lmstudio, dsr1 (Deep Seek R1 over Azure), dsv3 (Deep Seek V3 over
Azure) and more. Calling chatgpt as `chatgpt -op dsr1` will use Deep Seek R1, for instance.

## Integration test it_test

The following tests should be executed from program it_test . The input files are in the current directory.
In all test cases the exit code should be 0. The comparisons should be case insensitive.

### Simple Answer

`chatgpt where are the united nations head quarters`
The output should contain the word 'New York' (case insensitive).

### Image Analysis

`chatgpt -i testpic.jpg what is this`
The output should contain the word 'hammer' (case insensitive).

### Text to Speech
`chatgpt -a testspeech.mp3 repeat this`
The output should contain the word 'world peace' (case insensitive).

### Tool use from JSON

`chatgpt -tf duplicate.json duplicate foo`
The output should contain the word 'foo' twice (case insensitive). The stderr should contain
'Calling tool duplicate' (case insensitive).

### Tool use from Shell Script

`chatgpt -ts duplicate.sh duplicate bar`
The output should contain the word 'bar' twice (case insensitive). The stderr should contain
'Calling tool duplicate' (case insensitive).

### JSON output with simple schema

`chatgpt -ra 'name, age int, height number: height in meters' Franz is 8 years and 1 meter 20 cm tall`
The output should be the string `{"name":"Franz","age":8,"height":1.2}`

### Concatenating prompt fragments

`chatgpt -p 'repeat this' -u 'four' -s 'Answer in German' one two three`
The output should be 'eins zwei drei vier' (case insensitive) after normalizing whitespace.

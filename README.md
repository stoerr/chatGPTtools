# My ChatGPT tools

These are some of growing set of tools and experiments around ChatGPT.
I started writing this for my own use in my sparetime and am extending it whenever I need something,
but most of that is already pretty stable, so you are welcome to use them, too!
I'll mark things that are new and thus unstable.
As far as the tools are web-based, they are deployed at the
[Github site](https://chatGPTtools.stoerr.net/) of this project.

https://chatGPTtools.stoerr.net/chatgpttools/0README.html
If you'd like to know what I'm professionally doing with ChatGPT,
[this](https://github.com/ist-dresden/composum-chatgpt-integration) might be more interesting for you.

If you find something interesting, please [contact me](http://www.stoerr.net/)!
You will also find many ChatGPT related things on [my Blog](http://www.stoerr.net/blog.html) , and there is also my
[Developers Tool Bench](https://github.com/stoerr/DevelopersChatGPTToolBench) which I'm growing.

Disclaimer: You know how it is - this is one of my sparetime projects and you're not paying me for that, so no 
warranties. But please do send me bug reports and suggestions.

I'm happy if you use it, I'm even happier if you tell me about your experiences and maybe some successful 
prompts or prompt fragments you used, and I'll jump up and down with joy if you link to my project or post about it 
somewhere. :-)

## What's here

- [ChatGPTTricks.md](ChatGPTTricks.md) contains a growing number of tipps and tricks around using ChatGPT and Github
  Copilot as a software developer etc. I intend to collect there much of the ChatGPT section in [my blog]
  (http://www.stoerr.net/blog.html), in short form.
- [bin/](bin/) contains a number of scripts around ChatGPT that help me in my daily work and might be interesting for
  you. See below (script list)
- [public/](docs/chatgpttools/) contains some pages that I often use to access ChatGPT quickly - the [chat.openai.com]
  (https://chat.openai.com/) interface is a bit annoying at times. See [public/0README.html].
- [templates/](templates/) some templates for use with [bin/chatgptapplytemplate](bin/chatgptapplytemplate) -
  basically an extended prompt with examples for ChatGPT to do something given a file.
- [personal/] contains an experiment to create a quick chat interface that supplies ChatGPT with a kind of long term
  memory.
- [docs/](docs/) has stuff that is available at https://chatGPTtools.stoerr.net/ - see below. 

## Bookmarklets deployed at https://chatGPTtools.stoerr.net/

- The ChatGPT Bookmarklet lets you summarize any webpage using ChatGPT, ask questions and more.
- The Grab Styles Bookmarklet lets you select an element from a page and extract it's HTML and applying CSS rules,
- e.g. to ask ChatGPT questions about it.
- There is also a [Dictation App](https://chatGPTtools.stoerr.net/dictation/index.html) that uses the OpenAI whisper 
  API to transcribe your speech into a textarea.

## Script list in bin/

There is a couple of scripts in bin/ which you might like. The main script is chatgpt , which allows to access
ChatGPT chat completion API from the command line in various ways; the other scripts usually use that for the AI
functions. Here is a list of the scripts, of course generated by ChatGPT through
[project-bin/_makescriptlist](project-bin/_makescriptlist) :-)

<!-- Start scriptlist -->

- `chatgptapplytemplate`: Apply a ChatGPT chat template to a file and print the result ChatGPT returns to stdout.
- `chatgptcreateimage`: Generates an image based on a textual prompt using OpenAI's DALL-E 3 model.
- `chatgptextractcodeblock`: Extracts and prints the contents of a code block delimited by triple backticks from stdin.
- `chatgptfixfile`: Modifies a file using the ChatGPT API and displays the differences.
- `chatgptlistmodels`: Lists all models available for chatgpt.
- `chatgptpromptlib`: Outputs prompt fragments with specified keys stored in a directory.
- `chatgptsearchascript`: Searches for a suitable ChatGPT related command line utility to perform a task.
- `chatgptspeak`: Generates audio from input text using OpenAI's TTS models.
- `chatgptsummarizeurl`: Fetches the content of a URL and sends a request to summarize the content to ChatGPT.
- `chatgpttokentool`: Tokenizes input file according to ChatGPT-3.5 / ChatGPT-4 tokenization with cl100k_base.
- `chatgpttranscription`: Transcribes audio files using the ChatGPT API.
- `createJavaUnittest`: Generates a JUnit 4 test for a Java file using ChatGPT.
- `findfilewithpattern`: Searches for files with IntelliJ style pattern.
- `suggestbash`: Sends a task description to ChatGPT, which returns a bash command line for the given task and prints it.
- `suggestfish`: Sends a task description to ChatGPT, which returns a fish command line for the given task and prints it.
- `urltotext`: Fetches the content of a URL and outputs it as text, including metadata.

<!-- End scriptlist -->

# Collection of ChatGPT Tipps and Tricks

This is a collection of ideas and Howtos which were either very surprising to me, took me a while to find or even
needed quite some work to find out.

## External tools for IntelliJ

IntelliJ allows you to define external tools which you can call after selecting e.g. a file and pass that file as
command line argument "$FilePath$" . Interestingly, it also allows prompting you with "$Prompt$" for an additional
text to be included into the command line. (There are many interesting
[other macros](https://www.jetbrains.com/help/idea/2023.1/built-in-macros.html) as well).

This is particularily interesting with createJavaScript, which you could give the arguments
`"$FilePath$" "$Prompt$"`. But doing the same thing with chatgpt itself, using the arguments `-f "$FilePath$"
"$Prompt$"` gives you a quick way to present ChatGPT with the contents of a file and have it do something, like
creating another file with examples taken from the given file.

## How have ChatGPT help with CSS detail problems.

ChatGPT has good CSS knowledge, but doesn't have (yet) the ability to view and understand a webpage. And if you are
developing a big application, the CSS and HTML are usually too large to present it to ChatGPT. So if you need help
with a detail: you can copy the HTML of an inspected element in Chrome devtools using "Edit as HTML" from the
context menu in the elements inspector, and use the "CSS Used" Chrome extension to copy the CSS that apply to it and
the subelements. That seems small enough to give to ChatGPT, though it's some work to translate the advice back into
the original CSS files.

(There is also SnappySnippet extension, whose CSS extration is not exactly helpful - it gives every element an ID and
collects the effective styles of the element, massively repeating everything.)

https://stackoverflow.com/questions/9196451/how-to-export-all-relevant-html-css-for-one-element
https://stackoverflow.com/questions/8407550/how-to-get-and-extract-matched-css-rules-on-dom-node

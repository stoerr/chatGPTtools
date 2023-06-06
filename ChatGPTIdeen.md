# Ideen für Tools mit ChatGPT

## Toolbox

- for too long java code: script that removes method bodies but keeps method signatures and Javadoc.
- study java code: have ChatGPT guess paths of superclasses and interfaces (caution for deep hierarchies), collect 
  code (perhaps shorten it with previous script) and answer questions according to that. Or answer questions 
  twostep: answer them on the individual (super)classes and summarize that together.
- fix maven build using fix a file, probably limited to unittests.
- Extract CSS for element, subelements and parents. https://stackoverflow.
  com/questions/9196451/how-to-export-all-relevant-html-css-for-one-element https://stackoverflow.com/questions/8407550/how-to-get-and-extract-matched-css-rules-on-dom-node

Things for IntelliJ:
Explain code (selection), Generate Comment, Performance Check, Security Check, Style Check, Improve Readability, 
Clean Code, (Generate Unit test)
Work on a selection in a file.


## Ergaenzungen von quickchatgpt.html
- Prompt-Teile per select oder checkbox
- Kann er irgend etwas steuern? Man kann ihm ein Kommando "gib mir Fragment soundso vom Inhalt der Webseite" zur Verfügung stellen. Kann er dann einen Plan entwickeln, die Webseite zusammenzufassen? Kann er eine Website erkunden / zusammenfassen, indem er Links folgt?
- Prompts für korrekte Dotty-Graphen entwickeln, und Bookmarklet zum Rendern und Instruktionen zum fixen von 
  Syntaxfehlern.

https://github[ComposumChatGPTIdeen.md](ComposumChatGPTIdeen.md).com/marketplace?type=&verification=&query=chatgpt-action+ 
https://github.com/marketplace/actions/chatgpt-action !!!!!!!!!!!!

## API
https://platform.openai.com/docs/api-reference/chat/create
export OPENAI_API_KEY="<OPENAI_API_KEY>"
https://platform.openai.com/docs/libraries/community-libraries
$HOME/.openai-api-key.txt

## Summary
- Summarize langes Dokument : URL, PDF, ...
- Frage in Bezug auf langes Dokument

There are several ways to use an API to summarize a text that is longer than the input limit of 4000 tokens. Here are some suggestions:

Break the text into smaller chunks: You can break the text into smaller chunks of 4000 tokens or less and summarize each chunk separately using the API. Then, you can combine the summaries to create a summary of the entire text.

Use an extractive summarization technique: Extractive summarization techniques involve selecting the most important sentences or phrases from a text to create a summary. You can use the API to extract the most important sentences from the text and create a summary based on those sentences. This approach can be effective for longer texts because it does not rely on processing the entire text at once.

Use a hybrid approach: You can use a combination of extractive and abstractive summarization techniques to summarize the text. First, you can use extractive summarization to identify the most important sentences or phrases in the text. Then, you can use abstractive summarization to generate a summary that is more concise and readable.

Use a pre-processing step: You can use a pre-processing step to reduce the length of the text before summarizing it. For example, you can remove stop words, punctuation, and other unnecessary elements from the text to make it more concise. This can help you stay within the API's input limit while still generating an accurate summary.

Use a different API or tool: If the text is too long for the API you are currently using, you may need to explore other options. There are many other APIs and tools available for summarizing text, and you may find that another option is better suited to your needs.

## Personal ChatGPT

From the users messages in this chat: please summarize everything that might aid ChatGPT (not the user) in future chats with the user for providing personalization, context and chat continuity. That can include, but is not limited to: personal details, interests and hobbies, preferences and goals. The summary should be 500 words of extremely compact language of high information density. Please emphasize on keeping and extending the information from the following summary, that was gathered from several conversations, while rephrasing and condensing is permitted. Summary starts:

The following text contains background information about the user, including personal details, interests, preferences, and conversation history. Please use this information to provide personalized and context-aware responses during the conversation:

## React

https://til.simonwillison.net/llms/python-react-pattern

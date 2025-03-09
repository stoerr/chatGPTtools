Have a look at index.html - read the complete file.

Compare the file bookmarkletmaker/bookmarkletmaker.html with the following specification and then update it if there are
differences. Use the same style as index.html. Make only minimal changes to bookmarkletmaker.html.

Specification:

It that can create a bookmarklet from a javascript fragment - including background, colors and frame with separators. 
It should have:
1. a one sentence description what it does
2. a description what a bookmarklet is. Link to index.html as examples for some bookmarklets of mine.
3. a text input for the title of the bookmarklet
4. a text area where one can enter a javascript fragment
5. an "Example" button that sets the text area to something to try it out and creates a bookmarklet from that,
and a "Clear" button that resets all inputs to empty.
6. A text that appears after that button is hit and contains a link with the bookmarklet that can be dragged into 
   the browsers bookmark bar and mention that you can also clock on it to execute the bookmarklet on this page.
   It should be made invisible again when the javascript fragment is changed.
7. a text that mentions that this page was created from the file prompt.md in that directory (linked) using 
   `chatgpt -m o3-mini -ocf ../exampleactions/chatgptpmcodev.cfg -pf bookmarkletmaker/prompt.md` , which should 
   always be visible.
8. A text area that shows the URL of the bookmarklet that is created.
9. The link and that area are always updated when the inputs are changed.
10. Buttons after that text area: "Copy to clipboard", "Decode" (which decodes the javascript fragment from the URL)
11. The "Decode" button writes the decoded javascript fragment into the first text area for the javascript fragment
12. A "Generate with AI" textarea where the user can type a prompt
13. A button "Generate" that sends that prompt to the OpenAI chat completion API with model o3-mini. The OpenAI API 
    key is taken from local storage in the browser with key 'openai_api_key'. If it's not there it's asked for with 
    'prompt' and saved there. The prompt should be prefixed with : "Print javascript code that follows the following 
    requirements. Only print the Javascript code, no comments.\n\n"  During the generation a spinner should be shown.

Include the proper SEO meta tags and make it a nicely looking UI in bootstrap style.

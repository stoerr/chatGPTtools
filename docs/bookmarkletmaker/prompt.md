Have a look at index.html - read the complete file.

Please create a new file bookmarkletmaker/bookmarkletmaker.html in the same style that can create a bookmarklet from 
a javascript fragment - including background, colors and frame with separators. It should have:
1. a one sentence description what it does
2. a description what a bookmarklet is. Link to index.html as examples for some bookmarklets of mine.
3. a text input for the title of the bookmarklet
4. a text area where one can enter a javascript fragment
5. a "Create Bookmarklet" button and an "Example" button that sets the text area to something to try it out and creates a bookmarklet from that,
and a "Clear" button that resets the text area to empty.
6. A text that appears after that button is hit and contains a link with the bookmarklet that can be dragged into 
   the browsers bookmark bar and mention that you can also clock on it to execute the bookmarklet on this page.
   It should be made invisible again when the javascript fragment is changed.
7. a text that mentions that this page was created from the file prompt.md in that directory (linked) using 
   `chatgpt -m o3-mini -ocf ../exampleactions/chatgptpmcodev.cfg -pf bookmarkletmaker/prompt.md` , which should 
   always be visible.
8. A text area that shows the URL of the bookmarklet that is created.
9. Buttons after that text area: "Copy to clipboard", "Decode" (which decodes the javascript fragment from the URL)

Include the proper SEO meta tags.

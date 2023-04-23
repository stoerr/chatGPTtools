# Bookmarklet to summarize webpage and ask questions, generated with ChatGPT

This is the result an interesting attempt to create the sourcecode for a bookmarklet to summarize any webpage
shown in the browser entirely with ChatGPT. The full story is [in my blog.]
(http://www.stoerr.net/blog/2023-04-23-developBookmarkletWithChatGPT.html).

Usage documentation generated with ChatGPT, too:

# ChatGPTBookmarklet User Guide

## Overview

ChatGPTBookmarklet is a browser bookmarklet that allows you to generate a summary of a web page and ask follow-up
questions using OpenAI's ChatGPT. This user guide will help you add the bookmarklet to your browser, obtain and set the
API key, and use its features.

## Adding the bookmarklet to your browser

1. Create a new bookmark in your browser (e.g., Chrome, Firefox, Safari, or Edge).
2. Name the bookmark (e.g., "ChatGPTBookmarklet").
3. Copy the JavaScript code for the ChatGPTBookmarklet, which starts with `javascript:(function(){...`.
4. Paste the copied code into the URL or Location field of the new bookmark.
5. Save the bookmark.

Now, you have successfully added the ChatGPTBookmarklet to your browser.

## Obtaining and setting the API key

1. Sign up for an OpenAI account at https://beta.openai.com/signup/.
2. Once you've signed up and logged in, go to the API Keys section: https://beta.openai.com/account/api-keys/.
3. Click on "Create API key" and copy the newly generated key.
4. Visit a web page where you want to use the ChatGPTBookmarklet.
5. Click on the ChatGPTBookmarklet bookmark you created earlier.
6. You will be prompted to enter the API key. Paste the copied key into the input field and click "OK".
7. The API key is now saved in your browser's local storage and will be used for future requests. You do not need to
   enter it again unless you clear your browser's local storage or use a different browser.

## Using the ChatGPTBookmarklet features

1. Visit a web page where you want to generate a summary or ask a question.
2. Click on the ChatGPTBookmarklet bookmark.
3. The bookmarklet will display a dialog with the summary of the page. The summary is generated using ChatGPT.
4. If you want to ask a question, type it in the textarea provided below the summary.
5. You can choose to include the page content in the context of your question by checking the "Include page content"
   checkbox.
6. Click the "Submit" button to send your question to ChatGPT.
7. The answer from ChatGPT will appear in the dialog, replacing the summary.
8. If you want to copy the answer to your clipboard, click the "Copy to clipboard" button.
9. To close the dialog, click on the close button ([X]) in the top-right corner or the "Close Dialog" button at the
   bottom.

You can use ChatGPTBookmarklet on any web page by clicking the bookmark and following the steps above.

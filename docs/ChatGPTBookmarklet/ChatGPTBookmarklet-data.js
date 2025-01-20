/** Loads the parts of the library that contain pure data, not code. */
(function (window) {
    window.hpsChatGPTBookmarklet = window.hpsChatGPTBookmarklet || {};

    var hpsChatGPTBookmarklet= {
        helptext: 'Usage:<br>' +
            'When you open the dialog, a request to summarize the text of the whole page is automatically sent to ChatGPT. You can also ask your own questions by typing the question into the Ask a question field and submit with the button or the enter key that to get an answer. If "include page content" is selected, the page text is added. If text was selected before calling this bookmarklet, we take the selected text instead. If the text is more than 2000 words (depending on the model), we replace the middle of the text by ... to avoid hitting ChatGPT limits. You can also copy the answer to the clipboard.<br>' +
            'The dialog is draggable on the title bar and the icons on the top right can maximize it or move it to the right or left.<br>The dictation button &#x1F3A4; can be used to dictate a question - keep the button pressed while you are talking.<br>' +
            'You can also add a screenshot of the current page to the message sent to ChatGPT. The "capture screenshot" button shows what is transmitted.',

        /** Three backticks to "quote" something in the prompt. */
        // We encode that to be able to process this with the chatgptfixfile script.
        threebackticks:  String.fromCharCode(96) + String.fromCharCode(96) + String.fromCharCode(96),

        prompts: {
            'Summarize': 'You are an expert content summarizer. Summarize the given content using the following Markdown format:\n' +
                '\n' +
                '\t1.\tONE SENTENCE SUMMARY: Provide a single, 20-word sentence summarizing the entire content.\n' +
                '\t2.\tMAIN POINTS: List the 10 most important points in 15 words or less per point.\n' +
                '\t3.\tTAKEAWAYS: Provide a list of the 5 best takeaways.\n' +
                '\n' +
                'Instructions:\n' +
                '\n' +
                '\t•\tUse the specified section headers and format.\n' +
                '\t•\tUse numbered lists, not bullets.\n' +
                '\t•\tEnsure no repetition across sections.\n' +
                '\t•\tDo not use the same opening words for different items.\n' +
                '\t•\tOnly output in human-readable Markdown. No warnings or notes.\n' +
                '\n' +
                'This prompt clearly directs the AI to produce the required summary with specific formatting and content guidelines.',
            'Takeaways (long!)': 'You extract surprising, insightful, and interesting information from text content, focusing on themes like the purpose and meaning of life, human flourishing, the future role of technology, artificial intelligence’s impact on humanity, memes, learning, books, continuous improvement, and related topics.\n' +
                '\n' +
                'Steps:\n' +
                '\n' +
                '\t1.\tSUMMARY: Summarize the content in 25 words, including the presenter and topics discussed.\n' +
                '\t2.\tIDEAS: Extract 20 to 50 surprising, insightful, or interesting ideas, each exactly 15 words.\n' +
                '\t3.\tINSIGHTS: Extract 10 to 20 refined and abstracted insights from the content, each exactly 15 words.\n' +
                '\t4.\tQUOTES: Extract 15 to 30 surprising, insightful, or interesting quotes using exact text from the content.\n' +
                '\t5.\tHABITS: Extract 15 to 30 practical personal habits, each exactly 15 words.\n' +
                '\t6.\tFACTS: Extract 15 to 30 surprising or interesting valid facts, each exactly 15 words.\n' +
                '\t7.\tREFERENCES: Extract all mentions of writing, art, tools, projects, and other sources of inspiration.\n' +
                '\t8.\tONE-SENTENCE TAKEAWAY: Provide a single 15-word sentence that captures the most important essence of the content.\n' +
                '\t9.\tRECOMMENDATIONS: Extract 15 to 30 surprising, insightful, or interesting recommendations, each exactly 15 words.\n' +
                '\n' +
                'Output Instructions:\n' +
                '\n' +
                '\t•\tOutput only in Markdown format.\n' +
                '\t•\tUse bulleted lists; do not repeat items.\n' +
                '\t•\tEnsure all sections are completed according to the specific word and item count instructions.',
            'Haiku': 'Create 3 Haiku that concisely capture the essence and main points of the provided input.',
            'For LinkDB': 'Fill the following markdown template with the information about the previous text and print the filled template.\n' +
                'The same placeholders should get the same content. Include both `---` from the example below.\n' +
                'Do not change the lines with the UNCHANGEABLEDATEPLACEHOLDER and UNCHANGEABLEURLPLACEHOLDER.\n' +
                'DO NOT print anything else except the template, not even ``` quotes.\n\n' +
                '---\n' +
                'filename: {suggested-filename-from-short-title-in-kebab-case-maximal-5-words}\n' +
                'category: {up to 3 comma separated list of keywords / categories (words) in Title Case. Prefer IEEE taxonomy.}\n' +
                'url: UNCHANGEABLEURLPLACEHOLDER\ntitle: {title of the webpage, replace : by a dash}\n' +
                'description: {One sentence description of the webpage}\n' +
                'date: UNCHANGEABLEDATEPLACEHOLDER\n' +
                '---\n' +
                '{important: include the previous line with the --- separator to separate front matter from the content, but remove this comment}\n\n' +
                '# {title of the webpage}\n\n' +
                '[UNCHANGEABLEURLPLACEHOLDER](UNCHANGEABLEURLPLACEHOLDER)\n\n' +
                '## Description\n\n' +
                '{One sentence description of the webpage}\n\n' +
                '## Summary\n\n' +
                '{summary of the content of the webpage, at most three paragraphs}\n\n'
        }
    };

    Object.assign(window.hpsChatGPTBookmarklet, hpsChatGPTBookmarklet);
})(window);

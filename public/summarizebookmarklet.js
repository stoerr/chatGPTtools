/* jshint -W028 */
// bookmarklets to summarize the shown webpage.
// replace XXXInsertAPIKeyHereXXX with your API key to use these bookmarklets.

// this summarizes the text on the page. (We might have to cut it down to 3000 words, because the API has a limit of 3000 words.)
javascript:(async () => {
    var apikey = "XXXInsertAPIKeyHereXXX";

    const maxwordcount = 2500;
    try {
        var text = window.getSelection().toString().trim() || document.body.innerText;
        var message = "Bitte fasse den folgenden Text auf Deutsch zusammen:\n\n" + text;
        var shortenedmsg = "";
        var wordcount = message.split(" ").length;
        if (wordcount > maxwordcount) {
            const words = message.split(" ");
            const middle = Math.floor(words.length / 2);
            const start = middle - maxwordcount / 2;
            const end = middle + maxwordcount / 2;
            const placeholder = " ... ";
            words.splice(start, end - start, placeholder);
            message = words.join(" ");
            shortenedmsg = "(Shortened from " + wordcount + " to 3000 words.)\n\n";
        }
        const t = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({model: "gpt-3.5-turbo", "messages": [{"role": "user", "content": message}]})
        }), e = await t.json();
        alert(shortenedmsg + e.choices.map(t => t.message.content));
    } catch (error) {
        alert(`Error: ${error}`);
    }
})();

// This allows asking questions about the text on the page. (We might have to cut it down to 3000 words, because the API has a limit of 3000 words.)
// The prompt should be something like "What is a xyzzy in the following text:" or "What are the reasons xyzzy is employed? Consider the following text:"
javascript:(async () => {
    var apikey = "XXXInsertAPIKeyHereXXX";

    const maxwordcount = 2500;
    const promptprefix = prompt("Frage in Bezug auf die Selektion oder den Seitentext; es wird 'Diese Frage bezieht sich auf den folgendem Text:' und dann der Text angehaengt. Bei Texten über 3000 Worte muss das Mittelsegment entfernt werden.", "Was sind die neuen oder überraschenden Informationen an folgendem Text?");
    var shortenedmsg = "";
    var text = window.getSelection().toString().trim() || document.body.innerText;
    var message = promptprefix + " Diese Frage bezieht sich auf den folgendem Text:\n\n" + text;
    var wordcount = message.split(" ").length;
    if (wordcount > maxwordcount) {
        const words = message.split(" ");
        const middle = Math.floor(words.length / 2);
        const start = middle - maxwordcount / 2;
        const end = middle + maxwordcount / 2;
        const placeholder = " ... ";
        words.splice(start, end - start, placeholder);
        message = words.join(" ");
        shortenedmsg = "(Shortened from " + wordcount + " to 3000 words.)\n\n";
    }
    try {
        const t = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({model: "gpt-3.5-turbo", "messages": [{"role": "user", "content": message}]})
        }), e = await t.json();
        alert(shortenedmsg + e.choices.map(t => t.message.content));
    } catch (error) {
        alert(`Error: ${error}`);
    }
})();

/** Bookmarklet to give ChatGPT some instruction and insert the result. */
javascript:(async () => {
    var apikey = "XXXInsertAPIKeyHereXXX";

    function insertText(text) {
        var focusedElement = document.activeElement;
        if (focusedElement.tagName == "INPUT" || focusedElement.tagName == "TEXTAREA") {
            var startPosition = focusedElement.selectionStart;
            var endPosition = focusedElement.selectionEnd;
            var beforeText = focusedElement.value.substring(0, startPosition);
            var afterText = focusedElement.value.substring(endPosition);
            focusedElement.value = beforeText + text + afterText;
            focusedElement.selectionStart = startPosition + text.length;
            focusedElement.selectionEnd = startPosition + text.length;
        } else {
            alert("Please focus on a text field or text area.");
        }
    }

    const message = prompt("ChatGPT prompt, whose results we want to insert");
    try {
        const t = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({model: "gpt-3.5-turbo", "messages": [{"role": "user", "content": message}]})
        }), e = await t.json();
        insertText(e.choices.map(t => t.message.content).join('\n').trim());
    } catch (error) {
        alert(`Error: ${error}`);
    }

})();

/** Bookmarklet to have ChatGPT run something considering the current content of the page, and insert the result. */
javascript:(async () => {
    var apikey = "XXXInsertAPIKeyHereXXX";

    const maxwordcount = 2500;
    const promptprefix = prompt("Frage in Bezug auf die Selektion oder den Seitentext; es wird 'Diese Frage bezieht sich auf den folgendem Text:' und dann der Text angehaengt. Bei Texten über 3000 Worte muss das Mittelsegment entfernt werden.", "Was sind die neuen oder überraschenden Informationen an folgendem Text?");
    var shortenedmsg = "";
    var text = window.getSelection().toString().trim() || document.body.innerText;
    var message = promptprefix + " Diese Frage bezieht sich auf den folgendem Text:\n\n" + text;
    var wordcount = message.split(" ").length;
    if (wordcount > maxwordcount) {
        const words = message.split(" ");
        const middle = Math.floor(words.length / 2);
        const start = middle - maxwordcount / 2;
        const end = middle + maxwordcount / 2;
        const placeholder = " ... ";
        words.splice(start, end - start, placeholder);
        message = words.join(" ");
        shortenedmsg = "(Shortened from " + wordcount + " to 3000 words.)\n\n";
    }

    function insertText(text) {
        var focusedElement = document.activeElement;
        if (focusedElement.tagName == "INPUT" || focusedElement.tagName == "TEXTAREA") {
            var startPosition = focusedElement.selectionStart;
            var endPosition = focusedElement.selectionEnd;
            var beforeText = focusedElement.value.substring(0, startPosition);
            var afterText = focusedElement.value.substring(endPosition);
            focusedElement.value = beforeText + text + afterText;
            focusedElement.selectionStart = startPosition + text.length;
            focusedElement.selectionEnd = startPosition + text.length;
        } else {
            alert("Please focus on a text field or text area.");
        }
    }

    try {
        const t = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({model: "gpt-3.5-turbo", "messages": [{"role": "user", "content": message}]})
        }), e = await t.json();
        insertText(shortenedmsg + e.choices.map(t => t.message.content).join('\n').trim());
    } catch (error) {
        alert(`Error: ${error}`);
    }
})();

// example to use for future scripts - load library and run it
javascript:/*THE.PRINTLIMINATOR*/(function () {
    function loadScript(a, b) {
        var c = document.createElement('script'), d = document.getElementsByTagName('head')[0], e = !1;
        c.type = 'text/javascript', c.src = a, c.onload = c.onreadystatechange = function () {
            e || this.readyState && 'loaded' != this.readyState && 'complete' != this.readyState || (e = !0, b())
        }, d.appendChild(c)
    }

    loadScript('//css-tricks.github.io/The-Printliminator/printliminator.min.js', function () {
        thePrintliminator.init()
    });
})();

(function () {
    var netStoerrGrabStyles = {
        basePath: '',

        init: function (basePath) {
            this.basePath = basePath;
        },

        generalHelp: function () {
            return `
            Highlight an element with the mouse and then click on it to get the HTML and CSS rules for it copied to the clipboard and logged to the console.
            `;
        },

        start: function () {
            try {
                const that = this;
                this.selectElement(async function (element) {
                    var css = that.collectCSSRules(element);
                    var elementdescr = "Selected element: " + element.tagName.toLowerCase() + "#" + element.id + "." + element.className;
                    var result = elementdescr;
                    result = result + "\n\n" + that.relevantHTML(element, css) + "\n\n";
                    console.log(result);
                    const wordcount = result.split(/\s+/).length;
                    that.copyToClipboard(result, function () {
                        alert("Rules for the element copied to clipboard and logged: " + elementdescr + "\n\n" + wordcount + " words.");
                    });

                });
            } catch (error) {
                console.error(error);
                alert(error);
            }
        },

        relevantHTML: function (element, css) {
            var html = netStoerrGrabStyles.htmlWithoutClassesNotUsedInCSS(element, css).trim() + "\n";
            let ancestor = element.parentElement;
            while (ancestor.tagName.toUpperCase() !== 'HTML') {
                html = `<${ancestor.tagName.toLowerCase()}${(ancestor.id ? ` id="${ancestor.id}"` : '')}${(ancestor.className ? ` class="${ancestor.className}"` : '')}>\n${html}</${ancestor.tagName.toLowerCase()}>`;
                ancestor = ancestor.parentElement;
            }
            html = `<${ancestor.tagName.toLowerCase()}${(ancestor.id ? ` id="${ancestor.id}"` : '')}${(ancestor.className ? ` class="${ancestor.className}"` : '')}>\n<head><style>\n${css}\n</style></head>${html}</${ancestor.tagName.toLowerCase()}>`;
            return html.replace(/<!--(.*?)-->/sg, '').replace(/\n(\s*\n)+/gm, '\n').replace(/\s+$/, ' ');
        },

        /** Copies element, removes all classes that don't appear in css and returns the outerHTML of that, deleting the copy again. */
        htmlWithoutClassesNotUsedInCSS: function (element, css) {
            var clone = element.cloneNode(true);
            var classes = Array.from(new Set(css.match(/\.[a-zA-Z0-9_-]+/g).map(s => s.substring(1))));
            for (const child of clone.querySelectorAll('*')) {
                var classlist = child.classList;
                for (const cl of classlist) {
                    if (!classes.includes(cl)) {
                        classlist.remove(cl);
                    }
                }
            }
            return clone.outerHTML;
        },

        copyToClipboard: function (text, callback) {
            if (!navigator.clipboard) {
                const tempEl = document.createElement("textarea");
                tempEl.value = text;
                document.body.appendChild(tempEl);
                tempEl.select();
                document.execCommand("copy");
                document.body.removeChild(tempEl);
                callback();
            } else {
                navigator.clipboard.writeText(text).then(
                    function () {
                        callback();
                    })
                    .catch(
                        function (error) {
                            alert("Could not copy to clipboard: " + error);
                            callback();
                        });
            }
        },

        collectCSSRules: function (element) {
            function collectAncestorsAndDescendants(element) {
                var ancestors = [];
                var ancestor = element.parentElement;
                while (ancestor) {
                    ancestors.push(ancestor);
                    ancestor = ancestor.parentElement;
                }

                var descendants = [];
                var nodes = [element];
                while (nodes.length > 0) {
                    var node = nodes.shift();
                    descendants.push(node);
                    var children = node.children;
                    for (const child of children) {
                        nodes.push(child);
                    }
                }

                return ancestors.concat(descendants);
            }

            function anyElementMatches(elements, selector) {
                if (!selector) return false;
                for (const element of elements) {
                    try {
                        if (element.matches(selector)) {
                            return true;
                        }
                        // check whether selector with all occurrences of :before or :after replaced by the empty string matches
                        const selectorWithoutBeforeAfter = selector.replace(/::?(before|after)/g, '');
                        if (element.matches(selectorWithoutBeforeAfter)) {
                            return true;
                        }
                    } catch (error) {
                        // that might happen if the selector is empty , can't help but ignore this
                    }
                }
                return false;
            }

            var elements = collectAncestorsAndDescendants(element);

            var allCSS = "";
            const sheets = document.styleSheets;
            for (const sheet of sheets) {
                try {
                    const rules = sheet.rules || sheet.cssRules;
                    let sheetCSS = "";
                    for (const rule of rules) {
                        if (rule.selectorText) {
                            if (anyElementMatches(elements, rule.selectorText)) {
                                sheetCSS += rule.cssText + "\n";
                            }
                        } else { // what would that be?
                            console.error("Rule without selectorText ", rule, " : ", JSON.stringify(rule));
                        }
                    }
                    if (sheetCSS) {
                        allCSS += "\n\n/* STYLESHEET: " + sheet.href + " */\n";
                        allCSS += sheetCSS;
                    }
                } catch (error) {
                    console.error("Error while processing stylesheet ", sheet, " : ", error);
                }
            }
            return allCSS;
        },

        selectElement: function (callback) {
            let selectedElement = null;
            let highlightedElement = null;
            let that = this;

            function handleMouseMove(event) {
                const elementUnderMouse = findElementUnderMouse(event.clientX, event.clientY);
                if (highlightedElement !== elementUnderMouse) {
                    if (highlightedElement !== null) {
                        resetElement(highlightedElement);
                    }
                    if (elementUnderMouse !== null) {
                        highlightedElement = elementUnderMouse;
                        highlightElement(highlightedElement);
                    } else {
                        highlightedElement = null;
                    }
                }
            }

            function handleKeyPress(event) {
                if (event.key === 'Escape') {
                    removeListeners();
                    if (highlightedElement !== null) {
                        resetElement(highlightedElement);
                    }
                } else if (event.key === 'ArrowUp' || event.key === 'p') {
                    if (highlightedElement && highlightedElement.parentElement) {
                        resetElement(highlightedElement);
                        highlightedElement = highlightedElement.parentElement;
                        highlightElement(highlightedElement);
                    }
                } else if (event.key === 'Enter') {
                    if (highlightedElement !== null) {
                        resetElement(highlightedElement);
                        selectedElement = highlightedElement;
                        highlightedElement = null;
                        removeListeners();
                        callback(selectedElement);
                    }
                } else if (event.key === 'd') {
                    if (highlightedElement !== null) {
                        const parent = highlightedElement.parentElement;
                        resetElement(highlightedElement);
                        highlightedElement.remove();
                        highlightedElement = parent;
                        highlightElement(highlightedElement);
                    }
                } else if (event.key === 'D') {
                    if (highlightedElement !== null) {
                        deleteAllExceptSelectedAndAncestors(highlightedElement);
                    }
                } else if (event.key === '?' || event.key === 'h') {
                    showHelp();
                } else { // not really for us, let others handle it
                    return false;
                }
                // we have handled it; don't let others destroy that.
                event.preventDefault();
                event.stopPropagation();
                return true;
            }

            function showHelp() {
                const helpText = `
                - Mouse hover: Highlight an element
                - Left-click: Select the highlighted element and perform the action
                - Control-click: Delete the highlighted element
                - Alt-click: Delete everything except the highlighted element and its ancestors and descendants
                - Escape: Stop the selection process
                - ArrowUp: Highlight the parent of the highlighted element
                - Enter: Select the highlighted element
                - d: Delete the highlighted element
                - D: Delete everything except the highlighted element and its ancestors and descendants
                - ? or h: Show this help message
                `;
                alert(that.generalHelp() + helpText);
            }

            function handleMouseClick(event) {
                if (highlightedElement !== null && !event.altKey && !event.metaKey) {
                    resetElement(highlightedElement);
                    selectedElement = highlightedElement;
                    highlightedElement = null;
                    removeListeners();
                    callback(selectedElement);
                }
            }

            function handleMetaClick(event) {
                if (highlightedElement !== null && !event.altKey && event.metaKey) {
                    event.preventDefault();
                    highlightedElement.remove();
                }
            }

            function handleAltClick(event) {
                if (highlightedElement !== null && event.altKey && !event.metaKey) {
                    event.preventDefault();
                    deleteAllExceptSelectedAndAncestors(highlightedElement);
                }
            }

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("click", handleMouseClick);
            document.addEventListener("keydown", handleKeyPress);
            document.addEventListener("click", handleMetaClick);
            document.addEventListener("click", handleAltClick);

            function removeListeners() {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("click", handleMouseClick);
                document.removeEventListener("keydown", handleKeyPress);
                document.removeEventListener("click", handleMetaClick);
                document.removeEventListener("click", handleAltClick);
            }

            function findElementUnderMouse(x, y) {
                const element = document.elementFromPoint(x, y);
                return element !== null ? element : document.body;
            }

            function highlightElement(element) {
                const oldstyle = element.getAttribute("style");
                const oldtitle = element.getAttribute("title");
                if (oldstyle) {
                    element.dataset.netStoerrGrabStylesOriginalStyle = oldstyle;
                    element.dataset.netStoerrGrabStylesOriginalTitle = oldtitle;
                }
                element.style.setProperty('outline', "3px solid red", "important");
                element.setAttribute("title", "\n    Press h for help.    \n");
            }

            function resetElement(element) {
                const oldstyle = element.dataset.netStoerrGrabStylesOriginalStyle;
                const oldtitle = element.dataset.netStoerrGrabStylesOriginalTitle;
                if (oldstyle) {
                    element.setAttribute("style", oldstyle);
                } else {
                    element.removeAttribute("style");
                }
                if (oldtitle) {
                    element.setAttribute("title", oldtitle);
                } else {
                    element.removeAttribute("title");
                }
                delete element.dataset.netStoerrGrabStylesOriginalStyle;
            }

            function getOriginalBorderStyle(element) {
                return element.dataset.originalBorderStyle || "none";
            }

            function deleteAllExceptSelectedAndAncestors(element) {
                const ancestors = [];
                let ancestor = element.parentElement;
                while (ancestor && ancestor.tagName.toUpperCase() !== 'HTML') {
                    ancestors.push(ancestor);
                    ancestor = ancestor.parentElement;
                }

                const body = document.body;
                while (body.firstChild) {
                    body.firstChild.remove();
                }

                let parent = body;
                for (const ancestor of ancestors) {
                    const clonedAncestor = ancestor.cloneNode(false);
                    parent.appendChild(clonedAncestor);
                    parent = clonedAncestor;
                }

                parent.appendChild(element);
            }

        },

    };

    window.netStoerrGrabStyles = netStoerrGrabStyles;
})();

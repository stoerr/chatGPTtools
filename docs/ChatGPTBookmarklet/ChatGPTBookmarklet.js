/** Contains the bootstrap loader: loads ChatGPTBookmarklet.html and adds it's css and js files to the shown document and then adds the dialog. */
(function (window) {
    window.hpsChatGPTBookmarklet = window.hpsChatGPTBookmarklet || {};

    const that = window.hpsChatGPTBookmarklet;

    that.init = async function (basePath, apikey, callbackWhenHTMLLoaded) {
        try {
            that.basePath = basePath;
            // remove trailing slash

            that.apikey = apikey;

            if (!that.dialog) {
                const response = await fetch(this.basePath + '/ChatGPTBookmarklet.html');

                if (response.ok) {
                    const html = await response.text();
                    const root = document.createElement('html');
                    root.innerHTML = html;

                    let scriptLoadPromises = [];  // array to hold promises for script loading
                    root.querySelectorAll('head > link').forEach((element) => {
                        element.href = that.basePath + '/' + element.getAttribute('href');
                        document.head.appendChild(element);
                    });
                    root.querySelectorAll('head > script').forEach((element) => {
                        const newElement = document.createElement('script');
                        newElement.src = that.basePath + '/' + element.getAttribute('src');
                        newElement.type = element.type;
                        scriptLoadPromises.push(new Promise((resolve, reject) => {
                            newElement.onload = () => resolve();
                            newElement.onerror = () => reject(new Error('Failed to load script ' + newElement.src));
                        }));
                        document.body.appendChild(newElement);
                    });
                    await Promise.all(scriptLoadPromises);

                    that.dialog = document.createElement('div');
                    root.querySelectorAll('body > *').forEach((element) => {
                        that.dialog.appendChild(element);
                    });
                    document.body.appendChild(that.dialog);

                    that.sanitizeZIndexes(root);
                } else {
                    console.error('Failed to load ChatGPTBookmarklet HTML fragment because of ' + response.status + ' ' + response.statusText);
                }
            }

            callbackWhenHTMLLoaded();
        } catch (e) {
            console.error('Failed to load ChatGPTBookmarklet HTML fragment because of ' + e);
        }
    };

    /** We find elements with z-index more than 999999999 that would be above us and reset their z-index below 999999999. */
    that.sanitizeZIndexes = function (root) {
        root.querySelectorAll('*').forEach((element) => {
            const zIndex = parseInt(window.getComputedStyle(element).zIndex);
            if (zIndex > 999999999) {
                var newZindex = zIndex / 3; // still smaller than 999999999 and might keep relative z-indexes
                if (zIndex > 2147383647) { // keep relative z-indexes if they are extremely high.
                    newZindex = zIndex - 1147483649;
                }
                element.style.setProperty('z-index', newZindex.toString(), 'important');
            }
        });
    };

    that.openDialog = async function () {
        // forward to implementation in other javascript file
        that.openDialogImpl();
    };
})
(window);

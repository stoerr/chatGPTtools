/** Contains the bootstrap loader: loads ChatGPTBookmarklet.html and adds it's css and js files to the shown document and then adds the dialog. */
(function (window) {
    window.hpsChatGPTBookmarklet = window.hpsChatGPTBookmarklet || {};

    window.hpsChatGPTBookmarklet.init = async function (basePath, apikey, callbackWhenHTMLLoaded) {
        try {
            const that = window.hpsChatGPTBookmarklet;

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
                            newElement.onerror = () => reject(new Error('Failed to load script ' + scriptElement.src));
                        }));
                        document.body.appendChild(newElement);
                    });
                    await Promise.all(scriptLoadPromises);

                    that.dialog = document.createElement('div');
                    root.querySelectorAll('body > *').forEach((element) => {
                        that.dialog.appendChild(element);
                    });
                    document.body.appendChild(that.dialog);
                } else {
                    console.error('Failed to load ChatGPTBookmarklet HTML fragment because of ' + response.status + ' ' + response.statusText);
                }
            }

            callbackWhenHTMLLoaded();
        } catch (e) {
            console.error('Failed to load ChatGPTBookmarklet HTML fragment because of ' + e);
        }
    };

    window.hpsChatGPTBookmarklet.openDialog = async function () {
        // forward to implementation in other javascript file
        window.hpsChatGPTBookmarklet.openDialogImpl();
    };

})
(window);

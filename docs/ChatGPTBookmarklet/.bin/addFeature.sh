#!/bin/bash
set -e
echo Attempt to add a new feature to the bookmarklet directly from the specification using ChatGPT.
# That was only semi successful - there was mostly something wrong that needed to be fixed.

mainname=ChatGPTBookmarklet

# feature="Add a maximize button [+] next to the close button [x] that maximizes the dialog over the whole screen. If the dialog is already maximized, it should be restored to the normal size. When maximized, the button should get the text [-] and when restored, it should get the text [+] again. Set the text of the button in the HTML / with Javascript, not in the CSS. Never use content attribute in CSS."
feature="Add a help button in the bottom button row that sets the answer div to a help text how to use the application."

changehtml="First step: modify $mainname.html file if necessary for the task. The CSS and javascript steps come later - do only output the changed HTML file for now. Do not include any CSS or javascript into the HTML file!"
changecss="Second step: modify the $mainname.css file if necessary for the task. The $mainname.html was already changed for the task and is only included for reference. The javascript modifications come later. The HTML is included for reference, do not include it into your response!"
changejs="Third step: modify the $mainname.js file. The $mainname.html and $mainname.css files are already changed for the task and are only included for reference. Do not include $mainname.html and $mainname.css into your response!"

if [ ! -f $mainname.html.orig ]; then
  chatgptfixfile $mainname.html "$feature" "$changehtml"
fi

if [ ! -f $mainname.css.orig ]; then
  chatgptfixfile -f $mainname.html $mainname.css "$feature" "$changecss"
fi

if [ ! -f $mainname.js.orig ]; then
  chatgptfixfile -f $mainname.html -f $mainname.css $mainname.js "$feature" "$changejs"
fi

echo DONE

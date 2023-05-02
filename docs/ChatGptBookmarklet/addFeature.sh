#!/bin/bash
set -e
echo adding a new feature to the bookmarklet

mainname=ChatGptBookmarklet

feature="Add a maximize button [+] next to the close button [x] that maximizes the dialog over the whole screen. If the dialog is already maximized, it should be restored to the normal size. When maximized, the button should get the text [-] and when restored, it should get the text [+] again."

changehtml="First step: modify $mainname.html file if necessary for the task. The CSS and javascript steps come later - do only output the changed HTML file for now."
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

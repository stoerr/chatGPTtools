# Dictation app using OpenAI Whisper

## Basic idea

The dictation app should be a simple web app that allows the user to dictate text into a textarea. While the user is
pressing the "Dictate" button, the app should listen to the user's voice. When the user releases the "Dictate" button,
the app should send the recorded audio to the OpenAI Whisper API and insert the result into the textarea at the current
cursor position. ("Push to talk" approach.) Beside the "Dictate" button, there should now also be a "Fixup" button that,
when clicked, will send the current text in the textarea to ChatGPT for corrections and reformatting. Additionally,
there should be a dropdown list with "en" and "de" as options, which is used for the language parameter of the Whisper
API.

## Webpage index.html

Using Bootstrap - a card spanning the whole browser window with the headline "Dictation", at the bottom there is a
button row with 5 buttons: "Dictate", "Fixup", "Undo", "Help", and "Terms". The design should be modern, with rounded
edges and a light bright silvery metallic look, a bit like MacOS, with a bit of a 3D effect. There should be some space
between the buttons. Below the main textarea, there is an additional textarea for relevant terms, which can help the
dictation service understand specific spellings. This textarea should be 10% of the size of the main textarea. It should
load `dictation.js` and the library `recorder.js`
from [https://cdnjs.cloudflare.com/ajax/libs/recorderjs/0.1.0/recorder.js](https://cdnjs.cloudflare.com/ajax/libs/recorderjs/0.1.0/recorder.js)

IDs for the relevant elements are:

- "dictation-textarea" for the textarea
- "dictation-termsarea" for the terms textarea
- "dictation-dictate" for the "Dictate" button
- "dictation-fixup" for the "Fixup" button
- "dictation-undo" for the "Undo" button
- "dictation-help" for the "Help" button

There should also be the help dialog with a description of how to use the app, including the new "Fixup" feature, and a
button to close it, and an error dialog that is shown when the OpenAI Whisper API returns an error, the audio recording
fails, or if the ChatGPT correction request fails.

The terms textarea allows the user to input relevant terms or phrases, which are sent to the Whisper API to improve the
accuracy of transcriptions, especially for uncommon or specialized words.

## dictation.js

After loading the page, the textarea should be resized so that the card takes the whole screen space - the headline and
the buttons should be visible. The terms textarea should be positioned below the main textarea and set to 10% of the
height of the main textarea.

The "Dictate" button should start recording audio when pressed and stop when released. The audio should be sent to the
OpenAI Whisper API, and the result should be inserted into the textarea at the current cursor position.

The new "Fixup" button should send the current text in the textarea to ChatGPT for corrections and reformatting. The
corrected and reformatted text should replace the current text in the textarea.

When inserting the new dictation into the text - make sure that a space (or other whitespace) separates the text before
the new transcribed text fragment, and a space (or other whitespace) separates the transcribed text fragment from the
rest of the text.

Make sure that recording is only started if it isn't running already, and that the timeout is cancelled when the
recording is stopped.

The "Undo" button should undo the last change in the textarea that is done by either the "Dictate" or the "Fixup".

The "Help" button should open the help dialog with a summary of the functionality of the app, including the new "Fixup"
feature, and a button to close it.

The OPENAI_API_KEY should be read from local storage with key `chatgpt_api_key`. If it is not there, the user should be
prompted to enter it. The key should be stored in local storage.


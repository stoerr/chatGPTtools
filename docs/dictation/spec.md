# Dictation app using OpenAI whisper

## Basic idea

The dictation app should be a simple web app that allows the user to dictate text into a textarea.
While the user is pressing the "Dictate" button, the app should listen to the user's voice.
When the user releases the "Dictate" button, the app should send the recorded audio to the OpenAI whisper API and
insert the result into the textarea at the current cursor position. ("Push to talk" approach.)
Beside the "Dictate" button there should be a dropdown list with "en" and "de" as options, which is used for
the language parameter of the Whisper API.

## webpage index.html

Using Bootstrap - a card spanning the whole browser window with headline "Dictation" , at the bottom
there is a button row with 3 buttons: "Dictate" and "Help".
The design should be modern, with rounded edges and light bright slivery metallic, a bit like MacOS, with
a bit of 3D effect.
There should be some space between the buttons.
The rest of the screen is filled with a textarea.
It should load dictation.js and the library recorder.js from
https://cdnjs.cloudflare.com/ajax/libs/recorderjs/0.1.0/recorder.js

IDs for the relevant elements are:

- "dictation-textarea" for the textarea
- "dictation-dictate" for the "Dictate" button
- "dictation-help" for the "Help" button

There should be also the help dialog with a description of how to use the app, and a button to close it,
and an error dialog that is shown when the OpenAI whisper API returns an error or the audio recording fails.

## dictation.js

After loading the page the text area should be resized so that the card takes the whole screen space - the
headline and the buttons should be visible.

The "Dictate" button should start recording the audio when pressed, and stop when released. The audio should be
sent to the OpenAI whisper API and the result should be inserted into the textarea at the current cursor position.
In file [whisperspec.html](whisperspec.html) there is a specification for the
[OpenAI whisper API](https://platform.openai.com/docs/api-reference/audio/createTranscription).
The optional parameter prompt should be filled with the entire text in the textarea up to the current cursor position.

When inserting the new dictation into the text - make sure that a space (or other whitespace) separates the text before
the new transcribed text fragment, and a space (or other whitespace) separates the transcribed text fragment from the
rest of the text.
Make sure that recording is only started if it isn't running already, and that the timeout is cancelled when the
recording is stopped .

The "Help" button should open the help dialog with a summary of the functionality of the app and a button to close it.

The OPENAI_API_KEY should be read from local storage with key chatgpt_api_key . If it is not there, the user should be
prompted to enter it. The key should be stored in local storage.

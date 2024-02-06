# Dictation app using OpenAI whisper

This is a simple dictation application that uses OpenAI's excellet whisper speech recognition to transcribe spoken text.
It works like 'push to talk': you can set the cursor into the text area whereever the text should be inserted, and then
either press the "Dictate" button or the hotkey (MacOS) Command + Ctrl + T to start recording. When you release the 
button, the recorded audio is sent to the OpenAI - please give it a few seconds.

## Implementation remarks

The whisper API allows adding a prompt to the transcription to guide it. We insert the text before the cursor as prompt.

## How this was created

This was almost completely created using ChatGPT with the Co-Developer GPT engine in a chat starting from the
[spec.md](spec/spec.md) file. I did, however, make a final round of making things more robust, since I had trouble
to get ChatGPT to do that. If you are curious: [here is the chat](spec/DictationApp.html).

# Dictation app using OpenAI whisper

The purpose of this app is to try how good OpenAI whisper speech recognition works, and especially to try out how good
that feature works that you can pass the existing text to whisper to improve the recognition of the next text fragments.
The text recognition works in a "push to talk" manner, i.e. the user presses a button to start recording, and releases
the button to stop recording and send the recorded audio to the whisper API. That can be the dictate button, or
the hotkey (MacOS) Command Ctrl T. The text is inserted at the current cursor position in the textarea.

## How this was created

This was almost completely created using ChatGPT with the Co-Developer GPT engine in a chat starting from the
[spec.md](spec.md) file. I did, however, make a final round of making things more robust, since I had trouble
to get ChatGPT to do that. [Here is the chat](https://chat.openai.com/share/de0fc7bd-225a-405e-866e-e7c2030d6e7d).

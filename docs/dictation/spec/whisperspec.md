## [Create transcription](/docs/api-reference/audio/createTranscription)

`POST` [https://api.openai.com/v1/audio/transcriptions](https://api.openai.com/v1/audio/transcriptions)

Transcribes audio into the input language.

### Request body

- **file** (`file`, Required): The audio file object (not file name) to transcribe, in one of these formats: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, or webm.
- **model** (`string`, Required): ID of the model to use. Only `whisper-1` is currently available.
- **language** (`string`, Optional): The language of the input audio. Supplying the input language in ISO-639-1 format will improve accuracy and latency. [See ISO-639-1 codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
- **prompt** (`string`, Optional): An optional text to guide the model's style or continue a previous audio segment. The prompt should match the audio language.
- **response_format** (`string`, Optional, Defaults to json): The format of the transcript output, in one of these options: `json`, `text`, `srt`, `verbose_json`, or `vtt`.
- **temperature** (`number`, Optional, Defaults to 0): The sampling temperature, between 0 and 1. Higher values will make the output more random, while lower values will make it more focused and deterministic.

### Returns

The transcribed text.

### Example request

```bash
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file=@"/path/to/file/audio.mp3" \
  -F model="whisper-1"
```

### Example response

```json
{
  "text": "Imagine the wildest idea that you've ever had, and you're curious about how it might scale to something that's a 100, a 1,000 times bigger. This is a place where you can get to do that."
}
```

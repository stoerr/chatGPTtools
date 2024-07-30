# OpenAI Chat Completion API:

A basic request works like this, when done with curl:

    curl https://api.openai.com/v1/chat/completions \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      -d '{
        "model": "gpt-4o-mini",
        "messages": [
          {
            "role": "user",
            "content": "Hello!"
          }
        ]
      }'

The relevant parts of the response are:

    {
      "choices": [{
        "message": {
          "role": "assistant",
          "content": "\n\nHello there, how may I assist you today?",
        },
        "finish_reason": "stop"
      }]
    }

The content contains the actual message. if finish_reason is not "stop" or there is no content, there should be an 
alert with the full response.

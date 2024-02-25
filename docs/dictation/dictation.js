// Elements
const textarea = document.getElementById('dictation-textarea');
const dictateButton = document.getElementById('dictation-dictate');
const helpButton = document.getElementById('dictation-help');

// Recorder setup
let recorder;
let audioStream;
let timeoutCall;
let isRecording = false;
let isStoppingRecording = false;
let openaiAPIKey;

const getOpenAIKey = () => {
    openaiAPIKey = localStorage.getItem('openai_api_key');
    if (!openaiAPIKey) {
        openaiAPIKey = prompt('Enter OpenAI API Key:', '');
        if (openaiAPIKey) localStorage.setItem('openai_api_key', openaiAPIKey);
    }
    return openaiAPIKey;

};

// Start recording
const startRecording = async () => {
    if (!isRecording && !isStoppingRecording) {
        isRecording = true;
        console.log('Recording...');
        audioStream = await navigator.mediaDevices.getUserMedia({audio: true});
        const audioContext = new AudioContext();
        const input = audioContext.createMediaStreamSource(audioStream);
        recorder = new Recorder(input, {numChannels: 1});
        recorder.record();
        timeoutCall = setTimeout(stopRecording, 300000); // Stop recording after 5 minutes
    }
};

// Stop recording and handle audio
const stopRecording = async () => {
    if (!isRecording || isStoppingRecording) return;
    isStoppingRecording = true;
    console.log('Stopping recording');
    dictateButton.disabled = true;
    recorder.stop();
    clearTimeout(timeoutCall);
    audioStream.getTracks().forEach(track => track.stop());
    recorder.exportWAV(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('model', 'whisper-1');
        formData.append('language', document.getElementById('dictation-language').value);
        // Optionally append the prompt
        const promptText = textarea.value.substring(0, textarea.selectionStart);
        formData.append('prompt', promptText);

        try {
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getOpenAIKey()}`
                },
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                // Insert transcription at current cursor position
                const cursorPosition = textarea.selectionStart;
                const textBefore = textarea.value.substring(0, cursorPosition);
                const textAfter = textarea.value.substring(cursorPosition);
                textarea.value = `${textBefore}${/\s$/.test(textBefore) ? '' : ' '}${data.text}${/^\s/.test(textAfter) ? '' : ' '}${textAfter}`;
                // set the cursor position just after the inserted text . Observe the possibly inserted space after textBefore, and before textAfter
                textarea.selectionStart = cursorPosition + (/\s$/.test(textBefore) ? 0 : 1) + data.text.length + (/^\s/.test(textAfter) ? 0 : 1);
                textarea.selectionEnd = textarea.selectionStart;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            dictateButton.disabled = false;
            recorder = null;
            isRecording = false;
            isStoppingRecording = false;
        }
    });
};

// Hotkey for dictation
window.addEventListener('keydown', function (e) {
    if (e.metaKey && e.ctrlKey && e.key === 't') {
        startRecording();
        e.preventDefault();
    }
});

window.addEventListener('keyup', function (e) {
    if (!isStoppingRecording) {
        stopRecording();
    }
});

// Event listeners
const attachEventListeners = () => {
    dictateButton.addEventListener('mousedown', startRecording);
    dictateButton.addEventListener('mouseup', stopRecording);
    fixupButton.addEventListener('click', fixupText);

    // Help dialog
    helpButton.addEventListener('click', () => {
        document.getElementById('dictation-help').addEventListener('click', function () {
            $('#helpModal').modal('show'); // Using jQuery for Bootstrap 4 compatibility
        });
    });
};

// Resize textarea to fill screen space
function resizeTextarea() {
    const headerHeight = document.querySelector('.card-title').offsetHeight;
    const footerHeight = document.querySelector('.card-footer').offsetHeight;
    const viewportHeight = window.innerHeight;
    const offset = headerHeight + footerHeight + document.querySelector('.card-footer').offsetHeight; // Correct offset calculation
    textarea.style.height = `${viewportHeight - offset}px`;
}

window.addEventListener('resize', resizeTextarea);
document.addEventListener('DOMContentLoaded', resizeTextarea);

const fixupButton = document.getElementById('dictation-fixup');

const fixupText = async () => {
    const text = textarea.value;
    const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [{
            "role": "system",
            "content": "Your are a professional dictation assistant and your task is to fix up the retrieved text into a cohesive well formatted text, correcting dictation errors like spelled-out punctuation, repeated words, grammar errors and other inconsistencies, and inserting line breaks to create paragraphs. The corrections must not distort the intended meaning. If there are dictation correction instructions in the text (e.g. 'Correction: remove last sentence'), they should be executed on the text."
        }, {
            "role": "user",
            "content": "Print the text to fix without any comments."
        }, {
            "role": "assistant",
            "content": `${text}`
        }, {
            "role": "user",
            "content": "Fix the text and print it without any comments, and format the text appropriately by separating it into paragraphs for readability and as appropriate for the intended format."
        }]
    };
    console.log(requestBody.messages);
    fixupButton.disabled = true;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getOpenAIKey()}`
            },
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        if (response.ok && data.choices[0].finish_reason === "stop" && data.choices[0].message.content) {
            textarea.value = data.choices[0].message.content.trim();
        } else {
            throw new Error(`API Error or unexpected response: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        fixupButton.disabled = false;
    }
};

attachEventListeners();

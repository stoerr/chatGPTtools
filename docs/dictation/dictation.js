// Retrieve OPENAI_API_KEY from localStorage or prompt the user
const OPENAI_API_KEY = localStorage.getItem('chatgpt_api_key') || prompt('Enter OpenAI API Key:', '');
if (OPENAI_API_KEY) localStorage.setItem('chatgpt_api_key', OPENAI_API_KEY);

// Elements
const textarea = document.getElementById('dictation-textarea');
const dictateButton = document.getElementById('dictation-dictate');
const helpButton = document.getElementById('dictation-help');

// Recorder setup
let recorder;
let audioStream;

// Start recording
const startRecording = async () => {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const input = audioContext.createMediaStreamSource(audioStream);
    recorder = new Recorder(input, { numChannels: 1 });
    recorder.record();
};

// Stop recording and handle audio
const stopRecording = async () => {
    recorder.stop();
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
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                // Insert transcription at current cursor position
                const cursorPosition = textarea.selectionStart;
                const textBefore = textarea.value.substring(0, cursorPosition);
                const textAfter = textarea.value.substring(cursorPosition);
                textarea.value = `${textBefore}${data.text}${textAfter}`;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
};

// Event listeners
const attachEventListeners = () => {
    dictateButton.addEventListener('mousedown', startRecording);
    dictateButton.addEventListener('mouseup', stopRecording);

    // Help dialog
    helpButton.addEventListener('click', () => {
        var helpModal = new bootstrap.Modal(document.getElementById('helpModal'), {keyboard: true});
helpModal.show();
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

attachEventListeners();
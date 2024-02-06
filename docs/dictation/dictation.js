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
let timeoutCall;
let isrecording = false;

// Start recording
const startRecording = async () => {
    if (!isrecording) {
        isrecording = true;
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
    if (!isrecording) return;
    console.log('Stopping recording');
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
                textarea.value = `${textBefore}${textBefore.endsWith(' ') ? '' : ' '}${data.text}${textAfter.startsWith(' ') ? '' : ' '}${textAfter}`;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
    recorder = null;
    isrecording = false;
};

// Hotkey for dictation
window.addEventListener('keydown', function (e) {
    if (e.metaKey && e.ctrlKey && e.key === 't') {
        startRecording();
        e.preventDefault();
    }
});

window.addEventListener('keyup', function (e) {
        stopRecording();
});

// Event listeners
const attachEventListeners = () => {
    dictateButton.addEventListener('mousedown', startRecording);
    dictateButton.addEventListener('mouseup', stopRecording);

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

attachEventListeners();

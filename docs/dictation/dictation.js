// Elements
const textarea = document.getElementById('dictation-textarea');
const termsarea = document.getElementById('dictation-termsarea');
const dictateButton = document.getElementById('dictation-dictate');
const helpButton = document.getElementById('dictation-help');

// Logging functionality
const logContent = document.getElementById('logContent');
const logPanel = document.getElementById('logPanel');
const logToggleIcon = document.getElementById('logToggleIcon');

function logMessage(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    const color = type === 'error' ? 'red' : type === 'warn' ? 'orange' : type === 'success' ? 'green' : 'black';
    logEntry.innerHTML = `<span style="color: gray;">[${timestamp}]</span> <span style="color: ${color};">${message}</span>`;
    logContent.appendChild(logEntry);
    logContent.scrollTop = logContent.scrollHeight;
    console.log(`[${timestamp}] ${message}`);
}

// Toggle log icon when panel is shown/hidden
$('#logPanel').on('shown.bs.collapse', function () {
    logToggleIcon.textContent = '▼';
});
$('#logPanel').on('hidden.bs.collapse', function () {
    logToggleIcon.textContent = '▶';
});

// Recorder setup
let recorder;
let audioStream;
let timeoutCall;
let isRecording = false;
let isStoppingRecording = false;
let isStartingRecording = false;
let openaiAPIKey;
let lastTexts = [];
let lastPosition;

const storage_api_key = 'openai_api_key';
const storage_relevant_terms = 'net-stoerr-chatgpt-dictation-relevant-terms';

if (!termsarea.value) termsarea.value = localStorage.getItem(storage_relevant_terms) || '';

const getOpenAIKey = () => {
    openaiAPIKey = localStorage.getItem(storage_api_key);
    if (!openaiAPIKey) {
        openaiAPIKey = prompt('Enter OpenAI API Key:', '');
        if (openaiAPIKey) localStorage.setItem(storage_api_key, openaiAPIKey);
    }
    return openaiAPIKey;

};

// Start recording
const startRecording = async (event, e1, e2) => {
    if (!isRecording && !isStoppingRecording && !isStartingRecording) try {
        isStartingRecording = true;
        logMessage('Starting recording...', 'info');
        console.log('Recording...');
        audioStream = await navigator.mediaDevices.getUserMedia({audio: true});
        logMessage('Microphone access granted', 'success');
        const audioContext = new AudioContext();
        const input = audioContext.createMediaStreamSource(audioStream);
        recorder = new Recorder(input, {numChannels: 1});
        recorder.record();
        timeoutCall = setTimeout(stopRecording, 300000); // Stop recording after 5 minutes
        isRecording = true;
        logMessage('Recording started successfully', 'success');
    } catch (error) {
        logMessage(`Error starting recording: ${error.message}`, 'error');
        console.error('Error starting recording:', error);
        alert(`Error starting recording: ${error.message}`);
    } finally {
        isStartingRecording = false;
    }
};

// Stop recording and handle audio
const stopRecording = async (event, e1, e2) => {
    if (isStartingRecording) {
        logMessage('Double click detected, waiting...', 'warn');
        alert('You probably did a double click. Please use "push to talk" - press and hold the button to record.');
        setTimeout(stopRecording, 500);
        return;
    }
    if (!isRecording || isStoppingRecording) return;
    isStoppingRecording = true;
    logMessage('Stopping recording...', 'info');
    console.log('Stopping recording');
    dictateButton.disabled = true;
    recorder.stop();
    clearTimeout(timeoutCall);
    audioStream.getTracks().forEach(track => track.stop());
    logMessage('Recording stopped, processing audio...', 'info');
    recorder.exportWAV(async (blob) => {

        try {
            logMessage(`Audio blob size: ${blob.size} bytes`, 'info');
            const formData = new FormData();
            formData.append('file', blob);
            formData.append('model', 'whisper-1');
            let value = document.getElementById('dictation-language').value;
            if (value) {
                formData.append('language', value);
                logMessage(`Language set to: ${value}`, 'info');
            }
            // Create a prompt from the existing text to guide the transcription
            let cursorPosition = document.activeElement === textarea ? textarea.selectionStart : lastPosition;
            let textAreaValue = textarea.value || '';
            let termsAreaValue = termsarea.value;
            if (termsAreaValue) localStorage.setItem(storage_relevant_terms, termsAreaValue);
            const textBefore = textAreaValue.substring(0, cursorPosition);
            const textAfter = textAreaValue.substring(cursorPosition);
            var promptText = '';
            if (textAfter) promptText = '... ' + textAfter + '\n\n' + '-'.repeat(80) + '\n\n';
            if (termsAreaValue) promptText += termsAreaValue + '\n\n' + '-'.repeat(80) + '\n\n';
            promptText += ' ';
            if (textBefore) promptText = textBefore;
            if (promptText) formData.append('prompt', promptText);

            logMessage('Sending audio to OpenAI Whisper API...', 'info');
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getOpenAIKey()}`
                },
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                logMessage(`Transcription received: "${data.text}"`, 'success');
                lastTexts.push(textarea.value);
                insertResult(data);
            } else {
                logMessage(`API Error: ${JSON.stringify(data.error)}`, 'error');
                throw new Error(data.error);
            }
        } catch (error) {
            logMessage(`Error: ${error.message}`, 'error');
            alert(`Error: ${error.message}`);
            console.error(error);
        } finally {
            dictateButton.disabled = false;
            recorder = null;
            isRecording = false;
            isStoppingRecording = false;
        }
    });
};

// Insert result into textarea
const insertResult = (data) => {
    // Insert transcription at current cursor position
    // set cursorPosition to textarea.selectionStart if textarea is focussed, otherwise to lastPosition
    let cursorPosition = document.activeElement === textarea ? textarea.selectionStart : lastPosition;
    let value = textarea.value || '';
    const textBefore = value.substring(0, cursorPosition);
    const textAfter = value.substring(cursorPosition);
    textarea.value = `${textBefore}${/\s$/.test(textBefore) || !textBefore ? '' : ' '}${data.text}${/^\s/.test(textAfter) ? '' : ' '}${textAfter}`;
    // set the cursor position just after the inserted text . Observe the possibly inserted space after textBefore, and before textAfter
    textarea.selectionStart = cursorPosition + (/\s$/.test(textBefore) ? 0 : 1) + data.text.length + (/^\s/.test(textAfter) ? 0 : 1);
    textarea.selectionEnd = textarea.selectionStart;
    lastPosition = textarea.selectionStart;
}

textarea.addEventListener('blur', () => {
    lastPosition = textarea.selectionStart;
});

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
    // Mouse events for desktop
    dictateButton.addEventListener('mousedown', startRecording);
    dictateButton.addEventListener('mouseup', stopRecording);
    
    // Touch events for mobile devices
    dictateButton.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent mouse events from firing
        logMessage('Touch start detected', 'info');
        startRecording(e);
    });
    dictateButton.addEventListener('touchend', (e) => {
        e.preventDefault(); // Prevent mouse events from firing
        logMessage('Touch end detected', 'info');
        stopRecording(e);
    });
    
    fixupButton.addEventListener('click', fixupText);
    undoButton.addEventListener('click', undo);

    document.getElementById('dictation-help').addEventListener('click', function () {
        $('#helpModal').modal('show');
    });
};

// Resize textarea to fill screen space
function resizeTextarea() {
    const headerHeight = document.querySelector('.card-title').offsetHeight;
    const footerHeight = document.querySelector('.card-footer').offsetHeight;
    const viewportHeight = window.innerHeight;
    const offset = headerHeight + footerHeight + document.querySelector('.card-footer').offsetHeight; // Correct offset calculation
    const areasheight = viewportHeight - offset;
    
    // On mobile devices (viewport width <= 768px), use smaller heights to ensure the dialog fits on screen
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // Use fixed smaller heights on mobile
        textarea.style.height = '150px';
        termsarea.style.height = '30px';
    } else {
        // Use dynamic heights on desktop
        textarea.style.height = `${areasheight * 9 / 10}px`;
        termsarea.style.height = `${areasheight / 10}px`;
    }
}

window.addEventListener('resize', resizeTextarea);
document.addEventListener('DOMContentLoaded', resizeTextarea);

const fixupButton = document.getElementById('dictation-fixup');
const undoButton = document.getElementById('dictation-undo');

function undo() {
    if (lastTexts.length > 0) {
        textarea.value = lastTexts.pop();
        logMessage('Undo performed', 'info');
    }
}

const fixupText = async () => {
    const text = textarea.value;
    logMessage('Starting text fixup...', 'info');
    const requestBody = {
        model: "gpt-5.1-mini",
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
        logMessage('Sending text to OpenAI for fixup...', 'info');
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
            logMessage('Text fixup completed successfully', 'success');
            lastTexts.push(textarea.value);
            textarea.value = data.choices[0].message.content.trim();
        } else {
            logMessage(`API Error or unexpected response: ${JSON.stringify(data)}`, 'error');
            throw new Error(`API Error or unexpected response: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        logMessage(`Fixup error: ${error.message}`, 'error');
        alert(`Error: ${error.message}`);
        console.error(error);
    } finally {
        fixupButton.disabled = false;
    }
};

attachEventListeners();

// Log initialization
logMessage('Dictation app initialized', 'success');
logMessage('User agent: ' + navigator.userAgent, 'info');

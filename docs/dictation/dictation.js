// Elements
const textarea = document.getElementById('dictation-textarea');
const termsarea = document.getElementById('dictation-termsarea');
const dictateButton = document.getElementById('dictation-dictate');
const continuousButton = document.getElementById('dictation-dictate-continuous');
const continuousGroup = document.getElementById('dictation-continuous-group');
const helpButton = document.getElementById('dictation-help');
const clearButton = document.getElementById('dictation-clear');
const modeSelect = document.getElementById('dictation-mode');
const deviceSelect = document.getElementById('dictation-device');
const readButton = document.getElementById('dictation-read');
const rendered = document.getElementById('dictation-rendered');

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

// ---------------- Mode selection (Whisper vs Browser Speech) ----------------
const MODE_WHISPER = 'whisper';
const MODE_BROWSER = 'browser';
const storage_mode = 'net-stoerr-chatgpt-dictation-mode';

const getMode = () => modeSelect.value === MODE_BROWSER ? MODE_BROWSER : MODE_WHISPER;

// The continuous "Dictate" function (with its language DDL) is only available in browser speech mode
const updateContinuousButtonVisibility = () => {
    if (getMode() === MODE_BROWSER) {
        continuousGroup.style.display = '';
    } else {
        continuousGroup.style.display = 'none';
        // Ensure it isn't left mid-dictation if the mode was switched away
        if (continuousDictating) {
            stopContinuousDictation();
        }
    }
};

if (localStorage.getItem(storage_mode)) {
    modeSelect.value = localStorage.getItem(storage_mode);
}
modeSelect.addEventListener('change', () => {
    localStorage.setItem(storage_mode, modeSelect.value);
    logMessage(`Transcription engine switched to: ${getMode() === MODE_BROWSER ? 'Browser Speech' : 'Whisper (OpenAI)'}`, 'warn');
    updateContinuousButtonVisibility();
});

// ---------------- Shared recording state ----------------
let timeoutCall;
let isRecording = false;
let isStoppingRecording = false;
let isStartingRecording = false;
let continuousDictating = false;
let activeProvider = null; // which provider is actually recording: MODE_BROWSER, MODE_WHISPER, or null
let lastTexts = [];
let lastPosition;

// Provider-specific state (only one provider is active at a time)
let recorder;
let audioStream;
let openaiAPIKey;
let recognition = null;
let recognitionFinalBuffer = '';

const storage_api_key = 'openai_api_key';
const storage_relevant_terms = 'net-stoerr-chatgpt-dictation-relevant-terms';
const storage_textarea = 'net-stoerr-chatgpt-dictation-textarea';
const storage_language = 'net-stoerr-chatgpt-dictation-language';
const storage_device = 'net-stoerr-chatgpt-dictation-device';

if (!termsarea.value) termsarea.value = localStorage.getItem(storage_relevant_terms) || '';
if (!textarea.value) textarea.value = localStorage.getItem(storage_textarea) || '';
const storedLanguage = localStorage.getItem(storage_language);
if (storedLanguage) document.getElementById('dictation-language').value = storedLanguage;

// The URL #anchor takes precedence over localStorage: if a valid compressed state is
// present in the hash, it overrides the fields restored above.
(async () => {
    const restored = await restoreStateFromAnchor(window.location.hash);
    if (restored) logMessage('Restored state from URL anchor', 'success');
})();

// ---------------- Input device selection ----------------
// Helper to return an exact deviceId constraint for the selected input, or {} for the default
const getSelectedDeviceConstraint = () => {
    const id = deviceSelect ? deviceSelect.value : '';
    return id ? { audio: { deviceId: { exact: id } } } : { audio: true };
};

const getSelectedDeviceId = () => deviceSelect ? deviceSelect.value : '';

// Enumerate available audio input devices and (re)populate the dropdown.
// device.labels are empty until the user grants microphone permission.
const refreshInputDevices = async () => {
    if (!deviceSelect) return;
    const previous = getSelectedDeviceId();
    let devices = [];
    try {
        devices = await navigator.mediaDevices.enumerateDevices();
        // Getting a real label may require an active mic permission (from a prior getUserMedia call).
        if (!devices.some(d => d.kind === 'audioinput' && d.label)) {
            await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop())).catch(() => {});
            devices = await navigator.mediaDevices.enumerateDevices();
        }
    } catch (e) {
        logMessage(`Could not enumerate input devices: ${e.message}`, 'error');
    }
    const mics = devices.filter(d => d.kind === 'audioinput');
    // Keep the current selection only if the device is still present.
    const currentStillPresent = mics.some(d => d.deviceId === previous);
    deviceSelect.innerHTML = '<option value="">(input device: default)</option>';
    mics.forEach(d => {
        const option = document.createElement('option');
        option.value = d.deviceId;
        option.textContent = d.label || 'Mic (no label - grant mic permission)';
        deviceSelect.appendChild(option);
    });
    if (currentStillPresent) {
        deviceSelect.value = previous;
    }
    if (mics.length > 0) {
        logMessage(`Input devices refreshed: ${mics.length} available`, 'info');
    }
};

if (localStorage.getItem(storage_device)) {
    deviceSelect.value = localStorage.getItem(storage_device);
}
deviceSelect.addEventListener('change', () => {
    localStorage.setItem(storage_device, deviceSelect.value);
    logMessage(`Input source selected: ${deviceSelect.value ? (deviceSelect.selectedOptions[0]?.text || 'device') : 'system default'}`, 'info');
});
deviceSelect.addEventListener('focus', () => {
    refreshInputDevices();
});

const getOpenAIKey = () => {
    openaiAPIKey = localStorage.getItem(storage_api_key);
    if (!openaiAPIKey) {
        openaiAPIKey = prompt('Enter OpenAI API Key:', '');
        if (openaiAPIKey) localStorage.setItem(storage_api_key, openaiAPIKey);
    }
    return openaiAPIKey;
};

const maxRecordingMs = 2 * 60 * 1000; // 2 minutes

const browserRecognizer = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) throw new Error('Browser speech recognition is not supported in this browser. Use Whisper mode instead.');
    return new SR();
};

// ---------------- Browser speech recognition ----------------
const initBrowserRecognition = () => {
    recognition = browserRecognizer();
    recognition.continuous = true;
    recognition.interimResults = false; // insert only final (stable) results
    // Best-effort device selection for browser speech recognition (Chromium supports audioTrackConstraints);
    // older engines ignore it and use the system default.
    const deviceId = getSelectedDeviceId();
    if (deviceId) {
        try { recognition.audioTrackConstraints = { deviceId: { exact: deviceId } }; } catch (e) { /* ignored */ }
    }
    const lang = document.getElementById('dictation-language').value;
    recognition.lang = lang || (navigator.language || 'en-US'); // BCP-47 is required by the Web Speech API
    recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                const text = result[0].transcript.trim();
                if (text) {
                    recognitionFinalBuffer += (recognitionFinalBuffer ? ' ' : '') + text;
                    insertText(text);
                    logMessage(`Recognized: "${text}"`, 'info');
                }
            }
        }
    };
    recognition.onerror = (event) => {
        if (event.error === 'aborted' || event.error === 'no-speech') return; // expected on normal stop
        logMessage(`Speech recognition error: ${event.error}`, 'error');
        alert(`Speech recognition error: ${event.error}`);
        // Full teardown so the UI state (buttons, continuous dictation) is reset
        stopRecording();
    };
    recognition.onend = () => {
        // Recognition ended on its own (e.g. browser timed out); finish normally
        if (isRecording) {
            stopBrowserRecognition();
        }
    };
};

const startBrowserRecognition = async () => {
    initBrowserRecognition();
    try {
        recognition.start();
    } catch (e) {
        // Recognition may already be started from a previous session; retry once after abort
        try {
            recognition.abort();
            recognition.start();
        } catch (e2) {
            logMessage(`Error starting speech recognition: ${e2.message}`, 'error');
            throw e2;
        }
    }
    isRecording = true;
    recognitionFinalBuffer = '';
    // The Web Speech API keeps listening until stopped or it times out on its own.
    timeoutCall = setTimeout(() => {
        logMessage('Auto-stopping speech recognition after 2 minutes', 'warn');
        stopRecording();
    }, maxRecordingMs);
};

const stopBrowserRecognition = () => {
    if (recognition) {
        try { recognition.stop(); } catch (e) { /* already stopped */ }
    }
    clearTimeout(timeoutCall);
};

// ---------------- Continuous dictation (browser mode only) ----------------
// Morph the "Dictate" button into a red "Stop" button while dictating
const setDictateContinuousButton = (dictating) => {
    continuousDictating = dictating;
    if (dictating) {
        continuousButton.textContent = '⏹ Stop';
        continuousButton.classList.remove('btn-primary');
        continuousButton.classList.add('btn-danger');
        continuousButton.title = 'Stop continuous dictation';
    } else {
        continuousButton.textContent = 'Dictate';
        continuousButton.classList.remove('btn-danger');
        continuousButton.classList.add('btn-primary');
        continuousButton.title = 'Start continuous dictation';
    }
};

const startContinuousDictation = async () => {
    if (isRecording || isStoppingRecording || isStartingRecording) return;
    isStartingRecording = true;
    try {
        logMessage('Starting continuous dictation...', 'info');
        activeProvider = MODE_BROWSER;
        await startBrowserRecognition();
        setDictateContinuousButton(true);
        logMessage('Continuous dictation started', 'success');
    } catch (error) {
        logMessage(`Error starting continuous dictation: ${error.message}`, 'error');
        alert(`Error starting continuous dictation: ${error.message}`);
        isRecording = false;
    } finally {
        isStartingRecording = false;
    }
};

const stopContinuousDictation = async () => {
    if (continuousDictating) {
        await stopRecording();
        setDictateContinuousButton(false);
        logMessage('Continuous dictation stopped', 'info');
    }
};

// ---------------- Whisper recording ----------------
const startWhisperRecording = async () => {
    audioStream = await navigator.mediaDevices.getUserMedia(getSelectedDeviceConstraint());
    logMessage('Microphone access granted', 'success');
    const audioContext = new AudioContext();
    const input = audioContext.createMediaStreamSource(audioStream);
    recorder = new Recorder(input, {numChannels: 1});
    recorder.record();
    timeoutCall = setTimeout(() => {
        logMessage('Auto-stopping recording after 2 minutes', 'warn');
        stopRecording();
    }, maxRecordingMs);
    isRecording = true;
};

const stopWhisperRecording = async () => {
    if (!recorder) {
        logMessage('No active Whisper recording to stop', 'warn');
        return;
    }
    recorder.stop();
    clearTimeout(timeoutCall);
    audioStream.getTracks().forEach(track => track.stop());
    logMessage('Recording stopped, processing audio...', 'info');
    await new Promise((resolve) => {
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
                resolve();
            }
        });
    });
};

// ---------------- Recording lifecycle (mode-agnostic) ----------------
const startRecording = async () => {
    if (isRecording || isStoppingRecording || isStartingRecording) return;
    isStartingRecording = true;
    try {
        logMessage('Starting recording...', 'info');
        console.log('Recording...');
        activeProvider = getMode();
        if (getMode() === MODE_BROWSER) {
            await startBrowserRecognition();
        } else {
            await startWhisperRecording();
        }
        logMessage('Recording started successfully', 'success');
    } catch (error) {
        logMessage(`Error starting recording: ${error.message}`, 'error');
        console.error('Error starting recording:', error);
        alert(`Error starting recording: ${error.message}`);
        isRecording = false;
    } finally {
        isStartingRecording = false;
    }
};

const stopRecording = async () => {
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

    if (activeProvider === MODE_BROWSER) {
        stopBrowserRecognition();
        if (recognitionFinalBuffer) {
            lastTexts.push(textarea.value);
            logMessage('Browser speech results', 'info');
        } else {
            logMessage('No speech recognized', 'warn');
        }
    } else {
        await stopWhisperRecording();
    }

    recorder = null;
    recognition = null;
    audioStream = null;
    activeProvider = null;
    isRecording = false;
    isStoppingRecording = false;
    dictateButton.disabled = false;
    // Ensure the continuous Dictate button is restored even on auto-stop or error
    if (continuousDictating) {
        setDictateContinuousButton(false);
    }
};

// Insert result into textarea
const insertText = (text) => {
    // set cursorPosition to textarea.selectionStart if textarea is focussed, otherwise to lastPosition
    let cursorPosition = document.activeElement === textarea ? textarea.selectionStart : lastPosition;
    let value = textarea.value || '';
    const textBefore = value.substring(0, cursorPosition);
    const textAfter = value.substring(cursorPosition);
    textarea.value = `${textBefore}${/\s$/.test(textBefore) || !textBefore ? '' : ' '}${text}${/^\s/.test(textAfter) ? '' : ' '}${textAfter}`;
    // set the cursor position just after the inserted text . Observe the possibly inserted space after textBefore, and before textAfter
    textarea.selectionStart = cursorPosition + (/\s$/.test(textBefore) ? 0 : 1) + text.length + (/^\s/.test(textAfter) ? 0 : 1);
    textarea.selectionEnd = textarea.selectionStart;
    lastPosition = textarea.selectionStart;
    textarea.focus();
    saveTextarea();
};

const insertResult = (data) => {
    lastPosition = document.activeElement === textarea ? textarea.selectionStart : lastPosition;
    insertText(data.text);
};

textarea.addEventListener('blur', () => {
    lastPosition = textarea.selectionStart;
});

// ---------------- Markdown render toggle (View / Edit) ----------------
const storage_view = 'net-stoerr-chatgpt-dictation-view';
let converter = new showdown.Converter();
const renderButton = document.getElementById('dictation-render');

const showRendered = () => {
    rendered.innerHTML = converter.makeHtml(textarea.value);
    rendered.style.display = '';
    textarea.style.display = 'none';
    termsarea.style.display = 'none';
    renderButton.textContent = 'Edit';
    renderButton.title = 'Go back to editing the text';
    rendered.scrollTop = 0;
    localStorage.setItem(storage_view, 'render');
};

const showEditing = () => {
    rendered.style.display = 'none';
    textarea.style.display = '';
    termsarea.style.display = '';
    renderButton.textContent = 'Render';
    renderButton.title = 'Render the text as markdown';
    localStorage.setItem(storage_view, 'edit');
};

// Clicking into the rendered text switches back to editing
rendered.addEventListener('mousedown', (e) => {
    e.preventDefault(); // don't lose selection inside the rendered view
    showEditing();
});
rendered.addEventListener('touchend', (e) => {
    e.preventDefault();
    showEditing();
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
    // Push to Talk: press and hold to start recording
    dictateButton.addEventListener('mousedown', startRecording);
    dictateButton.addEventListener('mouseup', () => {
        stopRecording();
    });

    // Touch events for mobile devices
    dictateButton.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent mouse events from firing
        logMessage('Touch start detected', 'info');
        startRecording(e);
    });
    dictateButton.addEventListener('touchend', (e) => {
        e.preventDefault(); // Prevent mouse events from firing
        logMessage('Touch end detected', 'info');
        stopRecording();
    });

    // Continuous dictation (browser mode only): click to start, the button becomes Stop, click again to stop
    continuousButton.addEventListener('click', () => {
        if (continuousDictating) {
            stopContinuousDictation();
        } else {
            startContinuousDictation();
        }
    });

    fixupButton.addEventListener('click', fixupText);
    undoButton.addEventListener('click', undo);

    readButton.addEventListener('click', () => {
        if (reading) {
            stopReading();
        } else {
            startReading();
        }
    });

    document.getElementById('dictation-help').addEventListener('click', function () {
        $('#helpModal').modal('show');
    });

    // Clear button handler: reset fields and language select
    if (clearButton) {
        clearButton.addEventListener('click', function () {
            textarea.value = '';
            termsarea.value = '';
            saveTextarea();
            const langSelect = document.getElementById('dictation-language');
            if (langSelect) langSelect.value = '';
            // Remove stored relevant terms from localStorage as user cleared them
            try {
                localStorage.removeItem(storage_relevant_terms);
                localStorage.removeItem(storage_textarea);
                localStorage.removeItem(storage_language);
            } catch (e) {
                console.warn('Could not remove storage item', e);
            }
            lastTexts = [];
            logMessage('Cleared all inputs and reset language', 'info');
        });
    }

    // Markdown render toggle
    renderButton.addEventListener('click', () => {
        if (rendered.style.display === 'none') {
            showRendered();
        } else {
            showEditing();
        }
    });

    // Process text with an arbitrary prompt
    processButton.addEventListener('click', openProcessModal);
    // Enter starts processing; Shift+Enter adds a new line
    processPrompt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('dictation-process-confirm').click();
        }
    });
    // Selecting a saved prompt replaces the prompt input
    processPrompts.addEventListener('change', () => {
        processPrompt.value = processPrompts.value;
    });
    document.getElementById('dictation-process-confirm').addEventListener('click', async () => {
        const prompt = processPrompt.value.trim();
        if (!prompt) {
            alert('Please enter a prompt.');
            return;
        }
        $('#processModal').modal('hide');
        savePrompt(prompt);
        loadPromptHistory();
        await processText(prompt);
    });
};

// Resize textarea to fill screen space
function resizeTextarea() {
    const headerHeight = document.querySelector('.card-title').offsetHeight;
    const footerHeight = document.querySelector('.card-footer').offsetHeight;
    const viewportHeight = window.innerHeight;
    const logPanelHeight = document.querySelector('.card.mt-2')?.offsetHeight || 40;
    const additionalSpacing = 30; // Account for paddings, margins, borders, and spacing between elements
    const offset = headerHeight + footerHeight + logPanelHeight + additionalSpacing;
    const areasheight = viewportHeight - offset;

    // On mobile devices (viewport width <= 768px), maximize textarea while ensuring buttons are visible
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // Use most of available space on mobile - 90% main + 10% terms
        textarea.style.height = `${areasheight * 9 / 10}px`;
        termsarea.style.height = `${areasheight / 10}px`;
    } else {
        // Use dynamic heights on desktop with 100% of available space
        textarea.style.height = `${areasheight * 9 / 10}px`;
        termsarea.style.height = `${areasheight / 10}px`;
    }
    rendered.style.height = textarea.style.height;
}

window.addEventListener('resize', resizeTextarea);
document.addEventListener('DOMContentLoaded', resizeTextarea);

const fixupButton = document.getElementById('dictation-fixup');
const undoButton = document.getElementById('dictation-undo');

function undo() {
    if (lastTexts.length > 0) {
        textarea.value = lastTexts.pop();
        saveTextarea();
        logMessage('Undo performed', 'info');
    }
}

const fixupText = async () => {
    const text = textarea.value;
    logMessage('Starting text fixup...', 'info');
    const requestBody = {
        model: "gpt-5-mini",
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
            saveTextarea();
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

// ---------------- Process text with an arbitrary prompt ----------------
const processButton = document.getElementById('dictation-process');
const processPrompt = document.getElementById('dictation-process-prompt');
const processPrompts = document.getElementById('dictation-process-prompts');
const storage_process_prompts = 'net-stoerr-chatgpt-dictation-process-prompts';

// Load and populate the saved prompt history (most recent first, at most 20 unique entries)
const loadPromptHistory = () => {
    let prompts = [];
    try { prompts = JSON.parse(localStorage.getItem(storage_process_prompts)) || []; } catch (e) { prompts = []; }
    processPrompts.innerHTML = '<option value="">(select a previous prompt)</option>';
    for (const p of prompts) {
        const option = document.createElement('option');
        option.value = p;
        option.textContent = p.length > 80 ? p.substring(0, 80) + '…' : p;
        processPrompts.appendChild(option);
    }
};

const savePrompt = (prompt) => {
    let prompts = [];
    try { prompts = JSON.parse(localStorage.getItem(storage_process_prompts)) || []; } catch (e) { prompts = []; }
    prompts = prompts.filter(p => p !== prompt); // keep unique
    prompts.unshift(prompt);
    prompts = prompts.slice(0, 20);
    try { localStorage.setItem(storage_process_prompts, JSON.stringify(prompts)); } catch (e) { /* storage full */ }
};

const processText = async (prompt) => {
    const text = textarea.value;
    logMessage('Starting text processing...', 'info');
    const requestBody = {
        model: "gpt-5-mini",
        messages: [
            {"role": "assistant", "content": "Please give me the text to process."},
            {"role": "user", "content": `${text}`},
            {"role": "assistant", "content": "What shall I do with this text?"},
            {"role": "user", "content": prompt}
        ]
    };
    processButton.disabled = true;
    try {
        logMessage('Sending text to OpenAI for processing...', 'info');
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
            logMessage('Text processing completed successfully', 'success');
            lastTexts.push(textarea.value);
            textarea.value = data.choices[0].message.content.trim();
            saveTextarea();
            if (rendered.style.display !== 'none') showRendered(); // refresh rendered view if active
        } else {
            logMessage(`API Error or unexpected response: ${JSON.stringify(data)}`, 'error');
            throw new Error(`API Error or unexpected response: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        logMessage(`Processing error: ${error.message}`, 'error');
        alert(`Error: ${error.message}`);
        console.error(error);
    } finally {
        processButton.disabled = false;
    }
};

const openProcessModal = () => {
    loadPromptHistory();
    processPrompt.value = '';
    $('#processModal').modal('show');
    processPrompt.focus();
};

// ---------------- Persist form settings ----------------
// State is stored twice: in localStorage and (with precedence) compressed into the URL #anchor
// so the whole text can be shared by copying the link. The anchor is a self-describing blob:
// "1:" + raw-deflate of the JSON state, base64url-encoded (widest URL-safe charset).

// Encode a binary string over the full URL-safe base64url alphabet (A-Z a-z 0-9 - _).
const bytesToBase64Url = (bytes) => {
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const base64UrlToBytes = (b64) => {
    b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
};

// Collect the persistent state object.
const collectState = () => ({
    text: textarea.value,
    terms: termsarea.value,
    language: document.getElementById('dictation-language').value || '',
    render: localStorage.getItem(storage_view) === 'render',
    updated: Date.now(), // forces a distinct anchor even if the text is unchanged, so share links stay fresh
});

// Compress + encode the state as a URL anchor value, e.g. "1:AbC…". Best effort.
const stateToAnchor = async () => {
    try {
        const json = JSON.stringify(collectState());
        const input = new TextEncoder().encode(json);
        const cs = new CompressionStream('deflate-raw');
        const stream = new Blob([input]).stream().pipeThrough(cs);
        const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
        return '1:' + bytesToBase64Url(compressed);
    } catch (e) {
        return null;
    }
};

// Async restore that reads the anchor with precedence over localStorage.
const restoreStateFromAnchor = async (hash) => {
    try {
        const h = (hash || '').replace(/^#/, '');
        const sep = h.indexOf(':');
        if (sep < 0) return false;
        if (h.substring(0, sep) !== '1') return false;
        const compressed = base64UrlToBytes(h.substring(sep + 1));
        const ds = new DecompressionStream('deflate-raw');
        const stream = new Blob([compressed]).stream().pipeThrough(ds);
        const json = new TextDecoder().decode(await new Response(stream).arrayBuffer());
        const state = JSON.parse(json);
        if (typeof state !== 'object' || state === null) return false;
        if (typeof state.text === 'string') textarea.value = state.text;
        if (typeof state.terms === 'string') termsarea.value = state.terms;
        if (typeof state.language === 'string') {
            const langSelect = document.getElementById('dictation-language');
            if (langSelect) langSelect.value = state.language;
        }
        if (state.render && textarea.value) showRendered();
        // Mirror the anchor state into localStorage so it survives an empty-hash reload
        try {
            localStorage.setItem(storage_textarea, textarea.value);
            localStorage.setItem(storage_relevant_terms, termsarea.value);
            localStorage.setItem(storage_language, document.getElementById('dictation-language').value);
        } catch (e) { /* ignored */ }
        return true;
    } catch (e) {
        return false;
    }
};

// Update the URL anchor (debounced) and localStorage together.
let anchorTimer;
const saveState = () => {
    try {
        localStorage.setItem(storage_textarea, textarea.value);
        localStorage.setItem(storage_relevant_terms, termsarea.value);
        localStorage.setItem(storage_language, document.getElementById('dictation-language').value || '');
    } catch (e) { /* storage full/unavailable */ }
    clearTimeout(anchorTimer);
    anchorTimer = setTimeout(async () => {
        const anchor = await stateToAnchor();
        if (anchor) {
            try { history.replaceState(null, '', '#' + anchor); } catch (e) { /* ignored */ }
        }
    }, 500);
};

const saveTextarea = () => saveState();
const saveTerms = () => saveState();
textarea.addEventListener('input', saveTextarea);
termsarea.addEventListener('input', saveTerms);
document.getElementById('dictation-language').addEventListener('change', (e) => {
    try { localStorage.setItem(storage_language, e.target.value); } catch (err) { /* ignore */ }
    saveState();
});

// ---------------- Read out text (browser speech synthesis) ----------------
let reading = false;

const pickReadVoice = (lang) => {
    const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    const base = (lang || '').split('-')[0].toLowerCase();
    return voices.find(v => base && v.lang.toLowerCase().split('-')[0] === base)
        || voices.find(v => v.default)
        || voices[0];
};

// Voices load asynchronously; trigger a refresh so pickReadVoice sees them early
if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

const setReadButton = (active) => {
    reading = active;
    if (active) {
        readButton.textContent = '⏹ Stop Reading';
        readButton.classList.remove('btn-info');
        readButton.classList.add('btn-danger');
        readButton.title = 'Stop reading out the text';
    } else {
        readButton.textContent = 'Read';
        readButton.classList.remove('btn-danger');
        readButton.classList.add('btn-info');
        readButton.title = 'Read out the text starting from the cursor using the browser\'s speech synthesis';
    }
};

// Split text into speakable chunks (~250 chars) at word boundaries, recording each chunk's absolute start offset
const splitIntoChunks = (text) => {
    const chunks = [];
    const maxLen = 250;
    let pos = 0; // absolute offset of the current chunk within the original `text` passed in
    while (text.length > maxLen) {
        let cut = text.lastIndexOf(' ', maxLen);
        if (cut < 0) cut = maxLen;
        const chunk = text.substring(0, cut);
        chunks.push({text: chunk, start: pos});
        pos += cut;
        text = text.substring(cut).replace(/^\s+/, (m) => {
            pos += m.length;
            return '';
        });
    }
    if (text) chunks.push({text, start: pos});
    return chunks;
};

// Move the textarea caret to the position currently being read out, so the user can follow along
const moveCursorTo = (pos) => {
    textarea.selectionStart = pos;
    textarea.selectionEnd = pos;
    lastPosition = pos;
};

// Speak the chunks in sequence, updating the caret as the read-aloud position advances
const speakSequence = (chunks, baseOffset, lang, voice) => {
    let i = 0;
    const speakNext = () => {
        if (i >= chunks.length) {
            setReadButton(false);
            return;
        }
        const chunk = chunks[i++];
        const utterance = new SpeechSynthesisUtterance(chunk.text);
        if (voice) {
            utterance.voice = voice;
            utterance.lang = lang || voice.lang;
        } else if (lang) {
            utterance.lang = lang;
        }
        utterance.onboundary = (e) => {
            if (typeof e.charIndex === 'number') {
                moveCursorTo(baseOffset + chunk.start + e.charIndex);
            }
        };
        utterance.onend = speakNext;
        utterance.onerror = () => {
            // Skip to the next chunk on transient errors; only stop on cancel
            if (!chunks[i]) setReadButton(false);
        };
        speechSynthesis.speak(utterance);
    };
    speakNext();
};

const startReading = () => {
    if (isRecording) {
        logMessage('Cannot read while recording', 'warn');
        return;
    }
    if (!('speechSynthesis' in window)) {
        logMessage('Speech synthesis not supported in this browser', 'error');
        alert('Speech synthesis is not supported in this browser.');
        return;
    }
    const text = textarea.value;
    if (!text.trim()) {
        logMessage('Nothing to read out', 'warn');
        return;
    }
    // Determine where to start: from the textarea cursor if focused, else from the last recorded position
    let cursorPosition = document.activeElement === textarea ? textarea.selectionStart : lastPosition;
    cursorPosition = Math.max(0, Math.min(cursorPosition, text.length));
    // If there is nothing left after the cursor (e.g. it is at the very end), start from the beginning
    if (!text.substring(cursorPosition).trim()) {
        cursorPosition = 0;
    }
    const snippet = text.substring(cursorPosition); // keep leading whitespace so caret positions stay accurate
    if (!snippet.trim()) {
        logMessage('No text to read out', 'warn');
        return;
    }
    speechSynthesis.cancel(); // stop any previous reading
    const lang = document.getElementById('dictation-language').value;
    const voice = pickReadVoice(lang);
    logMessage(`Reading out ${snippet.length} characters from position ${cursorPosition}`, 'info');
    setReadButton(true);
    speakSequence(splitIntoChunks(snippet), cursorPosition, lang, voice);
};

const stopReading = () => {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    setReadButton(false);
};

attachEventListeners();
updateContinuousButtonVisibility();

// Restore last used view (Render/edit) on load
if (localStorage.getItem(storage_view) === 'render' && textarea.value) {
    showRendered();
}

// Log initialization
logMessage('Dictation app initialized', 'success');
logMessage('Transcription engine: ' + (getMode() === MODE_BROWSER ? 'Browser Speech' : 'Whisper (OpenAI)'), 'info');
logMessage('User agent: ' + navigator.userAgent, 'info');

// Reload state when the URL anchor changes (history nav, or a pasted share link)
window.addEventListener('hashchange', async () => {
    const restored = await restoreStateFromAnchor(window.location.hash);
    if (restored) logMessage('Restored state from URL anchor', 'success');
});

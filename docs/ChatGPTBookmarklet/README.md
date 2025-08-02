# ChatGPT Bookmarklet

## Introduction

The ChatGPT Bookmarklet is a browser tool that allows you to instantly summarize and ask questions about any web page content using OpenAI's ChatGPT API. Simply click the bookmarklet and it opens an interactive dialog that can:

- **Automatically summarize** the current page content
- **Answer questions** about the page content  
- **Include screenshots** of the page for visual analysis
- **Support multiple AI backends** (OpenAI, Anthropic, etc.)
- **Provide predefined prompts** for common tasks
- **Record voice input** for dictating questions
- **Maintain conversation history** with back/forward navigation
- **Work on any website** without requiring installation

Key features:
- Draggable, resizable dialog interface
- Smart content extraction from web pages
- Automatic text clipping for large content (respects API limits)
- Screenshot capture and transmission to AI
- Multiple layout modes (overlay, side-by-side, expanded)
- Voice dictation support
- Clipboard integration
- Backend configuration for different AI providers

The tool extracts the main content from web pages (avoiding navigation, ads, etc.) and sends it to ChatGPT along with your questions. If you have text selected on the page, it uses that instead of the full page content.

## Configuration

### Getting Started

1. **Get a ChatGPT API Key (Optional with Advanced Configuration)**: Visit [OpenAI's platform](https://platform.openai.com/), log in, and create an API key under "View API keys" in your profile settings. This is required for the default OpenAI configuration, but optional if you provide advanced backend configuration with embedded authentication.

2. **Create the Bookmarklet**: 
   - Visit the bookmarklet generator page (index.html)
   - Either enter your API key for simple OpenAI usage, OR provide advanced JSON backend configuration with embedded authentication headers
   - Drag the generated "ChatGPT Bookmarklet" link to your browser's bookmarks bar

3. **Use the Bookmarklet**: Click the bookmark on any web page to open the dialog and start asking questions.

### Advanced Configuration

**Important**: Since the bookmarklet runs on many different websites, configuration must be embedded directly into the bookmarklet code itself, similar to how the API key is currently handled.

**Configuration workflow:**
1. Visit the bookmarklet generator (index.html) 
2. Enter your API key and optional JSON backend configuration
3. Generate a bookmarklet that embeds both the API key and full configuration
4. Within the dialog, a "Configure" button links back to index.html with current settings in the URL hash
5. The generator pre-fills the form fields and immediately removes the hash from browser history
6. Modify settings and generate a new bookmarklet to replace the old one

**Configuration structure:**
```json
{
  "backends": [
    {
      "name": "OpenAI", 
      "baseUrl": "https://api.openai.com/v1",
      "headers": [{"name": "Authorization", "value": "Bearer sk-..."}],
      "models": ["gpt-4", "gpt-3.5-turbo"],
      "defaultModel": "gpt-4"
    },
    {
      "name": "Anthropic",
      "baseUrl": "https://api.anthropic.com/v1", 
      "headers": [
        {"name": "x-api-key", "value": "YOUR_ANTHROPIC_KEY"},
        {"name": "anthropic-version", "value": "2023-06-01"}
      ],
      "defaultModel": "claude-3-sonnet-20240229",
      "autoselect": ".*anthropic.*"
    }
  ]
}
```

**Configuration options:**
- `backends`: Array of AI service configurations
- `name`: Display name for the backend
- `baseUrl`: API endpoint URL  
- `headers`: Authentication headers
- `models`: Optional custom model list (otherwise fetched from API)
- `defaultModel`: Optional model to pre-select when switching to this backend
- `autoselect`: Regex pattern to auto-select backend based on current URL

**Backend Selection:**

The bookmarklet features a prominent backend dropdown selector that appears before the model selection. This allows you to:

- **Switch between configured backends**: Choose from OpenAI, Anthropic, local LLM servers, or any other configured AI service
- **Automatic model loading**: When you select a backend, the model dropdown is automatically populated with:
  - Models specified in the backend's `models` array (if configured)
  - Models fetched from the backend's `/models` API endpoint (if no models array is provided)
  - An empty dropdown if model loading fails (e.g., due to authentication issues)
- **Smart filtering**: Models are filtered to show only relevant AI models (excludes audio, transcription, and dated models)
- **Auto-selection**: Backends can be automatically selected based on the current page URL using the `autoselect` regex pattern

**Model Selection:**

The model dropdown appears after the backend selector and shows:
- All available models for the selected backend
- Models are sorted alphabetically for easy browsing
- If a backend has no models configured and the API call fails, the dropdown will be empty

**UI Layout:**

The backend and model selectors are prominently displayed in the dialog with clear labels:
```
Backend: [OpenAI ▼]  Model: [gpt-4 ▼]
```

## Implementation remarks

### Architecture

The bookmarklet uses a modular architecture split across several files:

- **Bootstrap loader** (`ChatGPTBookmarklet.js`): Dynamically loads the dialog HTML and all dependencies
- **UI Implementation** (`ChatGPTBookmarklet-impl.js`): Core dialog functionality and user interactions
- **Library functions** (`ChatGPTBookmarklet-lib.js`): Utility functions for content extraction and API calls
- **Data and prompts** (`ChatGPTBookmarklet-data.js`): Predefined prompts and help text
- **Styling** (`ChatGPTBookmarklet.css`): Complete UI styling
- **HTML template** (`ChatGPTBookmarklet.html`): Dialog structure and controls

### Key Technical Features

**Content Extraction**: Intelligently extracts main content using CSS selectors for common content containers (`article`, `main div#content-body`, etc.) while avoiding navigation and sidebar elements.

**Dynamic Loading**: The bookmarklet dynamically loads all required CSS and JavaScript files, making it self-contained and ensuring it works on any website without conflicts.

**Z-index Management**: Automatically detects and adjusts elements with high z-index values to ensure the dialog appears above all page content.

**Screenshot Integration**: Uses html2canvas library to capture page screenshots that can be sent to vision-capable AI models.

**Voice Input**: Integrates with browser's Web Speech API for voice dictation of questions.

**Smart Text Handling**: Automatically clips long content (>2000 words depending on model) by removing middle sections while preserving beginning and end context.

**Cross-browser Compatibility**: Works across all modern browsers with consistent behavior.

## Files in this directory

### Core Files
- **`ChatGPTBookmarklet.js`** - Bootstrap loader that dynamically loads the dialog and all dependencies
- **`ChatGPTBookmarklet-impl.js`** - Main implementation with dialog functionality, event handlers, and user interactions  
- **`ChatGPTBookmarklet-lib.js`** - Utility library with content extraction, API communication, and helper functions
- **`ChatGPTBookmarklet-data.js`** - Data definitions including predefined prompts, help text, and configuration
- **`ChatGPTBookmarklet.html`** - HTML template defining the dialog structure and all UI controls
- **`ChatGPTBookmarklet.css`** - Complete styling for the dialog interface and responsive design

### Supporting Files
- **`html2canvas.min.js`** - External library for capturing page screenshots
- **`index.html`** - Web page for generating the bookmarklet with API key integration
- **`ideas.txt`** - Development notes and feature ideas for future enhancements
- **`README.md`** - This documentation file

### Usage Notes
The `index.html` file serves as both documentation and a generator tool. Users enter their API key, and it creates a personalized bookmarklet that includes their credentials. The bookmarklet code is URL-encoded and embedded as a `javascript:` bookmark that can be dragged to the browser's bookmark bar.

All files work together to create a seamless experience where clicking the bookmark loads the necessary components dynamically and opens an interactive AI-powered dialog for any web page.

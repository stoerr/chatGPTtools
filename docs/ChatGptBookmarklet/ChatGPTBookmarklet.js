// ChatGPTBookmarklet.js

async function loadChatGPTComponents(basePath) {
  // Load the ChatGPTBookmarklet CSS
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.type = 'text/css';
  cssLink.href = basePath + '/ChatGPTBookmarklet.css';
  document.head.appendChild(cssLink);

  // Load the ChatGPTBookmarklet HTML fragment
  const response = await fetch(basePath + '/ChatGPTBookmarklet.html');
  if (response.ok) {
    const htmlContent = await response.text();
    const chatGPTContainer = document.createElement('div');
    chatGPTContainer.innerHTML = htmlContent;
    document.body.appendChild(chatGPTContainer);
    return chatGPTContainer;
  } else {
    console.error('Failed to load ChatGPTBookmarklet HTML fragment');
    return null;
  }
}

function showChatGPTDialog(chatGPTContainer) {
  if (chatGPTContainer) {
    chatGPTContainer.style.display = 'block';
  }
}

export async function initChatGPTBookmarklet(PATH_TO_APPLICATION) {
  // Check if the ChatGPT components have already been loaded
  if (!window.hpsChatGPTComponents) {
    const chatGPTContainer = await loadChatGPTComponents(PATH_TO_APPLICATION);
    window.hpsChatGPTComponents = {
      container: chatGPTContainer,
      showDialog: () => showChatGPTDialog(chatGPTContainer),
    };
  }

  // Show the ChatGPT dialog
  window.hpsChatGPTComponents.showDialog();

  // Your application logic and event listeners
  const dialog = window.hpsChatGPTComponents.container.querySelector(
    "#hpsChatGPTDialog"
  );
  const closeButtonTop = dialog.querySelector("#hpsChatGPTCloseTop");
  const closeButtonBottom = dialog.querySelector("#hpsChatGPTCloseBottom");
  const submitButton = dialog.querySelector("#hpsChatGPTSubmit");
  const copyToClipboardButton = dialog.querySelector(
    "#hpsChatGPTCopyToClipboard"
  );
  const questionInput = dialog.querySelector("#hpsChatGPTQuestion");
  const includePageContentCheckbox = dialog.querySelector(
    "#hpsChatGPTIncludePageContent"
  );
  const answerContainer = dialog.querySelector("#hpsChatGPTAnswer");

  // Implement the function to close the dialog
  function closeDialog() {
    dialog.style.display = "none";
  }

  // Attach event listeners to the close buttons
  closeButtonTop.addEventListener("click", closeDialog);
  closeButtonBottom.addEventListener("click", closeDialog);

  // Attach event listeners to the submit button
  submitButton.addEventListener("click", async () => {
    // Get the question text and whether to include the page content
    const question = questionInput.value;
    const includePageContent = includePageContentCheckbox.checked;

    // Call the ChatGPT API with the question and the page content (if applicable)
    const answer = await getAnswerFromChatGPT(
      question,
      includePageContent ? document.body.innerText : ""
    );

    // Display the answer in the answer container
    answerContainer.innerHTML = answer;
  });

  // Attach event listener to the copy to clipboard button
  copyToClipboardButton.addEventListener("click", () => {
    // Copy the answer to the clipboard
    const textarea = document.createElement("textarea");
    textarea.value = answerContainer.innerText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    // Optionally, show a message to the user confirming the copy
    alert("Answer copied to clipboard");
  });
}

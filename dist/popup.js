"use strict";
// Escuchar mensajes del service worker
chrome.runtime.onMessage.addListener((message) => {
    const contentDiv = document.getElementById('content');
    if (!contentDiv)
        return;
    if (message.type === 'translation') {
        contentDiv.innerHTML = `
            <div class="result-container">
                <div class="original-text">${message.originalText}</div>
                <div class="translated-text">${message.translatedText}</div>
            </div>
        `;
    }
    else if (message.type === 'error') {
        contentDiv.innerHTML = `
            <div class="error-message">
                ${message.errorMessage}
            </div>
        `;
    }
});

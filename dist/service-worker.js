"use strict";
// Crea un ítem en el menú contextual
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "translateSelection",
        title: "Traducir texto seleccionado",
        contexts: ["selection"],
    });
    chrome.contextMenus.create({
        id: "testEndpoints",
        title: "Test Endpoints",
        contexts: ["all"],
    });
});
// Listener para manejar clics en el menú contextual
chrome.contextMenus.onClicked.addListener((info, tab) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(tab === null || tab === void 0 ? void 0 : tab.id))
        return;
    if (info.menuItemId === "testEndpoints") {
        try {
            yield testEndpoints(tab.id);
        }
        catch (error) {
            yield chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (errorMsg) => {
                    console.error('Error en tests:', errorMsg);
                },
                args: [error.message],
            });
        }
    }
    else if (info.menuItemId === "translateSelection" && info.selectionText) {
        try {
            const translatedText = yield translateWithOllama(info.selectionText, tab.id);
            // Intentar enviar el mensaje al content script
            try {
                yield chrome.tabs.sendMessage(tab.id, {
                    type: 'translation',
                    originalText: info.selectionText,
                    translatedText: translatedText
                });
            }
            catch (error) {
                // Si falla el envío al content script, inyectamos el script manualmente
                yield chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
                // Intentamos enviar el mensaje nuevamente después de inyectar el script
                yield chrome.tabs.sendMessage(tab.id, {
                    type: 'translation',
                    originalText: info.selectionText,
                    translatedText: translatedText
                });
            }
        }
        catch (error) {
            // Si hay un error en la traducción, intentamos mostrarlo a través del content script
            try {
                yield chrome.tabs.sendMessage(tab.id, {
                    type: 'error',
                    errorMessage: error instanceof Error ? error.message : String(error)
                });
            }
            catch (contentError) {
                // Si falla el envío al content script, mostramos el error mediante scripting
                yield chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (errorMsg) => {
                        const overlay = document.createElement('div');
                        overlay.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              z-index: 999999;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              padding: 16px;
              border: 2px solid #dc3545;
              color: #dc3545;
            `;
                        overlay.textContent = errorMsg;
                        document.body.appendChild(overlay);
                        setTimeout(() => overlay.remove(), 5000);
                    },
                    args: [error.message]
                });
            }
        }
    }
}));
// Función para traducir texto usando Ollama
function translateWithOllama(text, tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("http://127.0.0.1:11434/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Origin": "http://localhost"
                },
                body: JSON.stringify({
                    model: "mistral",
                    prompt: `Traduce este texto del inglés al español. Responde SOLO con la traducción, sin ningún texto adicional: "${text}"`,
                    stream: false
                }),
            });
            const responseText = yield response.text();
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
            }
            const data = JSON.parse(responseText);
            return data.response
                .trim()
                .replace(/^["']|["']$/g, '') // Elimina comillas
                .replace(/^\s*-\s*/, '') // Elimina guiones
                .replace(/\n/g, ' ') // Elimina saltos de línea
                .trim();
        }
        catch (error) {
            throw new Error(`Error en la traducción: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
// Función para probar diferentes tipos de peticiones
function testEndpoints(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Test 1: GET /api/version
            yield chrome.scripting.executeScript({
                target: { tabId },
                func: () => console.log('Test 1: GET /api/version'),
            });
            const versionResponse = yield fetch("http://127.0.0.1:11434/api/version");
            const versionText = yield versionResponse.text();
            yield chrome.scripting.executeScript({
                target: { tabId },
                func: (status, text) => console.log('Version response:', status, text),
                args: [versionResponse.status, versionText]
            });
            // Test 2: POST con Origin correcto
            yield chrome.scripting.executeScript({
                target: { tabId },
                func: () => console.log('Test 2: POST con Origin correcto'),
            });
            const generateResponse = yield fetch("http://127.0.0.1:11434/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Origin": "http://localhost"
                },
                body: JSON.stringify({
                    model: "mistral",
                    prompt: "hello",
                    stream: false
                })
            });
            // Convertimos los headers a un objeto
            const headers = {};
            generateResponse.headers.forEach((value, key) => {
                headers[key] = value;
            });
            // Capturamos toda la información de la respuesta
            const responseInfo = {
                status: generateResponse.status,
                statusText: generateResponse.statusText,
                headers: headers,
                body: yield generateResponse.text(),
                type: generateResponse.type,
                url: generateResponse.url,
                ok: generateResponse.ok
            };
            yield chrome.scripting.executeScript({
                target: { tabId },
                func: (info) => {
                    console.log('Respuesta completa:');
                    console.log(info);
                },
                args: [responseInfo]
            });
            return "Tests completados";
        }
        catch (error) {
            yield chrome.scripting.executeScript({
                target: { tabId },
                func: (errorMessage) => console.error('Error completo:', errorMessage),
                args: [(error instanceof Error) ? error.message : String(error)]
            });
            throw error;
        }
    });
}

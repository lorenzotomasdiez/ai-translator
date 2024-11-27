// Marcar que el content script está instalado
// @ts-ignore
window.hasAITranslatorContentScript = true;

console.log('%cAI Translator content script loaded!', 'color: green; font-size: 14px; font-weight: bold');

// Función para testear que el content script está funcionando
function testContentScript() {
    console.log('Content script test function called');
    createOverlay({
        type: 'translation',
        originalText: 'Test message',
        translatedText: 'Mensaje de prueba'
    });
}

// Exponer la función de test globalmente
// @ts-ignore
window.testAITranslator = testContentScript;

const createOverlay = (message: { type: 'translation' | 'error', originalText?: string, translatedText?: string, errorMessage?: string }) => {
    console.log('%cCreating overlay:', 'color: blue; font-weight: bold', message);
    
    // Eliminar overlay existente si hay uno
    const existingOverlay = document.getElementById('ai-translator-overlay-12345');
    if (existingOverlay) {
        console.log('Removing existing overlay');
        existingOverlay.remove();
    }

    // Crear el overlay
    const overlay = document.createElement('div');
    overlay.id = 'ai-translator-overlay-12345';
    overlay.setAttribute('data-testid', 'ai-translator-overlay');
    overlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999999;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 16px;
        max-width: 300px;
        font-family: Arial, sans-serif;
        animation: slideIn 0.3s ease-out;
        border: 2px solid #4CAF50;
    `;

    // Añadir estilos de animación
    const styleId = 'ai-translator-styles-12345';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Crear botón de cerrar
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        border: none;
        background: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
        padding: 0 6px;
        transition: color 0.2s;
    `;
    closeButton.onmouseover = () => {
        closeButton.style.color = '#000';
    };
    closeButton.onmouseout = () => {
        closeButton.style.color = '#666';
    };
    closeButton.onclick = () => {
        console.log('Close button clicked');
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => overlay.remove(), 300);
    };

    // Contenido
    const content = document.createElement('div');
    content.id = 'ai-translator-content-12345';
    if (message.type === 'translation') {
        content.innerHTML = `
            <div style="color: #666; margin-bottom: 8px; font-size: 14px;">
                ${message.originalText}
            </div>
            <div style="color: #000; font-size: 16px; margin-top: 8px;">
                ${message.translatedText}
            </div>
        `;
    } else {
        content.innerHTML = `
            <div style="color: #dc3545;">
                ${message.errorMessage}
            </div>
        `;
    }

    overlay.appendChild(closeButton);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    console.log('Overlay added to DOM');
};

// Mejorar el listener de mensajes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('%cMessage received in content script:', 'color: purple; font-weight: bold', {
        message,
        sender
    });
    
    try {
        createOverlay(message);
        sendResponse({ success: true });
    } catch (error) {
        console.error('Error in content script:', error);
        sendResponse({ success: false, error: String(error) });
    }
    
    return true;
});

// Añadir instrucciones de debugging en la consola
console.log(`
%cAI Translator Debugging Instructions:
1. Para probar el overlay manualmente, ejecuta en la consola:
   window.testAITranslator()
2. Para verificar si el content script está cargado:
   window.hasAITranslatorContentScript
3. Busca mensajes con estos IDs:
   - ai-translator-overlay-12345
   - ai-translator-content-12345
   - ai-translator-styles-12345
`, 'color: green; font-size: 12px'); 
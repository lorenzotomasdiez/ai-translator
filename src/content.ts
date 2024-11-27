// Marcar que el content script está instalado
// @ts-ignore
window.hasAITranslatorContentScript = true;

// Función para testear que el content script está funcionando
function testContentScript() {
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
    const existingOverlay = document.getElementById('ai-translator-overlay-12345');
    if (existingOverlay) {
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
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => overlay.remove(), 300);
    };

    // Contenido
    const content = document.createElement('div');
    content.id = 'ai-translator-content-12345';
    if (message.type === 'translation') {
        content.innerHTML = `
            <div style="color: #666 !important; margin-bottom: 8px; font-size: 14px; all: initial; font-family: Arial, sans-serif;">
                ${message.originalText}
            </div>
            <div style="color: #000 !important; font-size: 16px; margin-top: 8px; all: initial; font-family: Arial, sans-serif;">
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
};

import { marked } from 'marked';

chrome.runtime.onMessage.addListener((message: {
  type: 'translation' | 'error' | 'showLoader' | 'hideLoader',
  originalText?: string,
  translatedText?: string,
  errorMessage?: string,
  text?: string
}) => {
  if (message.type === 'showLoader') {
    const existingLoader = document.getElementById('ai-translator-loader-12345');
    if (existingLoader) {
      existingLoader.remove();
    }

    const loader = document.createElement('div');
    loader.id = 'ai-translator-loader-12345';
    loader.setAttribute('data-testid', 'ai-translator-loader');
    loader.style.cssText = `
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
      border: 2px solid #007bff;
    `;

    loader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="spinner" style="
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <span style="color: #000 !important; all: initial; font-family: Arial, sans-serif; font-size: 14px;">${message.text || 'Traduciendo...'}</span>
      </div>
    `;

    // Añadir keyframes para la animación del spinner
    const styleId = 'ai-translator-loader-styles-12345';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styleElement);
    }

    document.body.appendChild(loader);
  } else if (message.type === 'hideLoader') {
    const loader = document.getElementById('ai-translator-loader-12345');
    if (loader) {
      loader.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => loader.remove(), 300);
    }
  } else if (message.type === 'translation') {
    // Remover el loader si existe
    const loader = document.getElementById('ai-translator-loader-12345');
    if (loader) {
      loader.remove();
    }
    
    // Resto del código existente para el manejo de traducciones...
    const renderMarkdown = async () => {
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
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      `;
      
      // Renderizar el markdown de forma asíncrona
      overlay.innerHTML = await marked(message.translatedText || '');
      
      // Añadir estilos para el markdown
      const style = document.createElement('style');
      style.textContent = `
        .translation-overlay {
            color: #000 !important;
        }
        .translation-overlay * {
            color: inherit !important;
        }
        .translation-overlay h3 {
          color: #2c3e50;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
          margin-top: 16px;
          margin-bottom: 8px;
        }
        .translation-overlay p {
          margin: 8px 0;
          line-height: 1.5;
        }
        .translation-overlay code {
          background: #f8f9fa;
          padding: 2px 4px;
          border-radius: 4px;
        }
      `;
      
      overlay.classList.add('translation-overlay');
      document.head.appendChild(style);
      document.body.appendChild(overlay);
      
      // Añadir botón de cerrar
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '×';
      closeButton.style.cssText = `
        position: absolute;
        top: 8px;
        right: 0px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
      `;
      closeButton.onclick = () => overlay.remove();
      overlay.appendChild(closeButton);
      
      // Auto-eliminar después de 30 segundos
      setTimeout(() => overlay.remove(), 30000);
    };

    renderMarkdown().catch(error => {
      console.error('Error al renderizar markdown:', error);
      createOverlay({
        type: 'error',
        errorMessage: `Error al renderizar la traducción: ${error.message}`
      });
    });
  }
}); 
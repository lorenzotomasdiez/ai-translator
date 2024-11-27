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
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 
                    0 1px 2px rgba(0, 0, 0, 0.04);
        padding: 16px;
        max-width: 320px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border: 0.5px solid rgba(0, 0, 0, 0.1);
    `;

    // Añadir estilos de animación
    const styleId = 'ai-translator-styles-12345';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = `
            @keyframes slideIn {
                from { 
                    transform: translateX(20px) scale(0.95);
                    opacity: 0;
                }
                to { 
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
            }
            @keyframes fadeOut {
                from { 
                    transform: scale(1);
                    opacity: 1;
                }
                to { 
                    transform: scale(0.95);
                    opacity: 0;
                }
            }
            @keyframes subtle-bounce {
                0% { transform: scale(1); }
                50% { transform: scale(0.98); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Crear botón de cerrar
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 12px;
        right: 12px;
        width: 20px;
        height: 20px;
        border: none;
        background: rgba(0, 0, 0, 0.06);
        border-radius: 50%;
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        padding: 0;
    `;
    closeButton.onmouseover = () => {
        closeButton.style.background = 'rgba(0, 0, 0, 0.1)';
        closeButton.style.color = 'rgba(0, 0, 0, 0.7)';
    };
    closeButton.onmouseout = () => {
        closeButton.style.background = 'rgba(0, 0, 0, 0.06)';
        closeButton.style.color = 'rgba(0, 0, 0, 0.5)';
    };
    closeButton.onmousedown = () => {
        closeButton.style.transform = 'scale(0.95)';
    };
    closeButton.onmouseup = () => {
        closeButton.style.transform = 'scale(1)';
    };
    closeButton.onclick = () => {
        overlay.style.animation = 'fadeOut 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => overlay.remove(), 200);
    };

    // Contenido
    const content = document.createElement('div');
    content.id = 'ai-translator-content-12345';
    if (message.type === 'translation') {
        content.innerHTML = `
            <div style="
                color: rgba(0, 0, 0, 0.6) !important;
                margin-bottom: 8px;
                font-size: 13px;
                font-weight: 400;
                letter-spacing: -0.08px;
                line-height: 1.4;
                all: initial;
                font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
            ">
                ${message.originalText}
            </div>
            <div style="
                color: rgba(0, 0, 0, 0.85) !important;
                font-size: 14px;
                font-weight: 400;
                letter-spacing: -0.1px;
                line-height: 1.5;
                margin-top: 8px;
                all: initial;
                font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
            ">
                ${message.translatedText}
            </div>
        `;
    } else {
        content.innerHTML = `
            <div style="
                color: #ff3b30;
                font-size: 13px;
                font-weight: 400;
                letter-spacing: -0.08px;
                line-height: 1.4;
            ">
                ${message.errorMessage}
            </div>
        `;
    }

    overlay.appendChild(closeButton);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Add hover effect to the entire overlay
    overlay.onmouseover = () => {
        overlay.style.transform = 'scale(1.01)';
        overlay.style.transition = 'transform 0.2s ease';
    };
    overlay.onmouseout = () => {
        overlay.style.transform = 'scale(1)';
    };
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
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 
                    0 1px 2px rgba(0, 0, 0, 0.04);
        padding: 16px;
        max-width: 320px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border: 0.5px solid rgba(0, 0, 0, 0.1);
    `;

    loader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div class="spinner" style="
                width: 18px;
                height: 18px;
                border: 2px solid rgba(0, 0, 0, 0.1);
                border-top: 2px solid rgba(0, 0, 0, 0.4);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <span style="
                color: rgba(0, 0, 0, 0.8) !important;
                all: initial;
                font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
                font-size: 13px;
                font-weight: 400;
                letter-spacing: -0.08px;
            ">${message.text || 'Traduciendo...'}</span>
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
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 
                        0 1px 2px rgba(0, 0, 0, 0.04);
            padding: 16px;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
            border: 0.5px solid rgba(0, 0, 0, 0.1);
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        // Renderizar el markdown de forma asíncrona
        overlay.innerHTML = await marked(message.translatedText || '');

        // Añadir estilos para el markdown
        const style = document.createElement('style');
        style.textContent = `
            .translation-overlay {
                color: rgba(0, 0, 0, 0.85) !important;
            }
            .translation-overlay * {
                color: inherit !important;
                font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif !important;
            }
            .translation-overlay h3 {
                color: rgba(0, 0, 0, 0.85);
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                padding-bottom: 8px;
                margin-top: 16px;
                margin-bottom: 8px;
                font-size: 15px;
                font-weight: 500;
                letter-spacing: -0.1px;
            }
            .translation-overlay p {
                margin: 8px 0;
                line-height: 1.5;
                font-size: 13px;
                letter-spacing: -0.08px;
            }
            .translation-overlay code {
                background: rgba(0, 0, 0, 0.05);
                padding: 2px 4px;
                border-radius: 4px;
                font-size: 12px;
                font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace !important;
            }
        `;

        overlay.classList.add('translation-overlay');
        document.head.appendChild(style);
        document.body.appendChild(overlay);

        // Añadir botón de cerrar con estilo macOS
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            width: 20px;
            height: 20px;
            border: none;
            background: rgba(0, 0, 0, 0.06);
            border-radius: 50%;
            font-size: 16px;
            line-height: 1;
            cursor: pointer;
            color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            padding: 0;
        `;
        
        // Añadir efectos hover al botón de cerrar
        closeButton.onmouseover = () => {
            closeButton.style.background = 'rgba(0, 0, 0, 0.1)';
            closeButton.style.color = 'rgba(0, 0, 0, 0.7)';
        };
        closeButton.onmouseout = () => {
            closeButton.style.background = 'rgba(0, 0, 0, 0.06)';
            closeButton.style.color = 'rgba(0, 0, 0, 0.5)';
        };
        closeButton.onclick = () => {
            overlay.style.animation = 'fadeOut 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => overlay.remove(), 200);
        };
        overlay.appendChild(closeButton);

        // Auto-eliminar después de 30 segundos
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.style.animation = 'fadeOut 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(() => overlay.remove(), 200);
            }
        }, 30000);
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
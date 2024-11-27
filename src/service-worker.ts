// Crea un ítem en el menú contextual

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translateSimple",
    title: "Traducción Simple",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "translateComplete",
    title: "Traducción Completa",
    contexts: ["selection"],
  });
});

// Listener para manejar clics en el menú contextual
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === "testEndpoints") {
    testEndpointsFn(tab.id);
  } else if ((info.menuItemId === "translateSimple" || info.menuItemId === "translateComplete") && info.selectionText) {
    try {

      await chrome.tabs.sendMessage(tab.id, {
        type: 'showLoader',
        text: 'Traduciendo...'
      }).catch(async () => {
        // Si falla, inyectamos el content script
        await chrome.scripting.executeScript({
          target: { tabId: tab.id as number },
          files: ['content.js']
        });
        // Intentamos mostrar el loader nuevamente
        await chrome.tabs.sendMessage(tab.id as number, {
          type: 'showLoader',
          text: 'Traduciendo...'
        });
      });

      const translatedText = await translateWithOllama(
        info.selectionText, 
        tab.id, 
        info.menuItemId === "translateSimple" ? "simple" : "complete"
      );

      await chrome.tabs.sendMessage(tab.id, {
        type: 'translation',
        originalText: info.selectionText,
        translatedText: translatedText
      });

      // Intentar enviar el mensaje al content script
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'translation',
          originalText: info.selectionText,
          translatedText: translatedText
        });
      } catch (error) {
        // Si falla el envío al content script, inyectamos el script manualmente
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });

        // Intentamos enviar el mensaje nuevamente después de inyectar el script
        await chrome.tabs.sendMessage(tab.id, {
          type: 'translation',
          originalText: info.selectionText,
          translatedText: translatedText
        });
      }

    } catch (error) {
      // Si hay un error en la traducción, intentamos mostrarlo a través del content script
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'hideLoader'
        });

        await chrome.tabs.sendMessage(tab.id, {
          type: 'error',
          errorMessage: error instanceof Error ? error.message : String(error)
        });
      } catch (contentError) {
        // Si falla el envío al content script, mostramos el error mediante scripting
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (errorMsg: string) => {
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
              max-width: 400px;
              max-height: 80vh;
              overflow-y: auto;
            `;

            // Usar marked.js para renderizar markdown (necesitarás inyectar marked.js en la página)
            overlay.innerHTML = `
              <div style="color: #dc3545; margin-bottom: 8px;">
                <strong>Error:</strong>
              </div>
              <div style="color: #333;">
                ${errorMsg}
              </div>
            `;

            document.body.appendChild(overlay);
            setTimeout(() => overlay.remove(), 8000);
          },
          args: [(error as Error).message]
        });
      }
    }
  }
});

// Función para traducir texto usando Ollama
async function translateWithOllama(text: string, tabId: number, mode: "simple" | "complete"): Promise<string> {
  try {
    const prompt = mode === "simple" 
      ? `Traduce este texto al español de forma simple y directa:\n${text}`
      : `Eres un asistente de traducción educativo. Por favor, proporciona:

1. La traducción directa al español
2. Un breve análisis del texto (máximo 2 líneas)
3. Si hay modismos o expresiones idiomáticas, explícalas brevemente
4. Si hay vocabulario importante, menciona sinónimos o usos alternativos

Formatea tu respuesta en Markdown así:

### Traducción
[traducción aquí]

### Análisis
[análisis breve aquí]

### Expresiones y Vocabulario
[explicaciones aquí, si aplica]

Texto a traducir:
${text}`;

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost"
      },
      body: JSON.stringify({
        model: "mistral",
        prompt: prompt,
        stream: false
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    return data.response.trim();
  } catch (error: unknown) {
    throw new Error(`Error en la traducción: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Función para probar diferentes tipos de peticiones
async function testEndpoints(tabId: number): Promise<string> {
  try {
    // Test 1: GET /api/version
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => console.log('Test 1: GET /api/version'),
    });

    const versionResponse = await fetch("http://127.0.0.1:11434/api/version");
    const versionText = await versionResponse.text();

    await chrome.scripting.executeScript({
      target: { tabId },
      func: (status, text) => console.log('Version response:', status, text),
      args: [versionResponse.status, versionText]
    });

    // Test 2: POST con Origin correcto
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => console.log('Test 2: POST con Origin correcto'),
    });

    const generateResponse = await fetch("http://127.0.0.1:11434/api/generate", {
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
    const headers: Record<string, string> = {};
    generateResponse.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Capturamos toda la información de la respuesta
    const responseInfo = {
      status: generateResponse.status,
      statusText: generateResponse.statusText,
      headers: headers,
      body: await generateResponse.text(),
      type: generateResponse.type,
      url: generateResponse.url,
      ok: generateResponse.ok
    };

    await chrome.scripting.executeScript({
      target: { tabId },
      func: (info) => {
        console.log('Respuesta completa:');
        console.log(info);
      },
      args: [responseInfo]
    });

    return "Tests completados";
  } catch (error: unknown) {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (errorMessage: string) => console.error('Error completo:', errorMessage),
      args: [(error instanceof Error) ? error.message : String(error)]
    });
    throw error;
  }
}

async function testEndpointsFn(tabId: number){
  try {
    await testEndpoints(tabId);
  } catch (error) {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (errorMsg: string) => {
        console.error('Error en tests:', errorMsg);
      },
      args: [(error as Error).message],
    });
  }
}
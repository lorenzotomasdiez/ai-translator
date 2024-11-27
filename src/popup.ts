document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader') as HTMLDivElement;
    const errorMessage = document.getElementById('error-message') as HTMLDivElement;
    const translationContent = document.getElementById('translation-content') as HTMLDivElement;

    // Mostrar el loader inicialmente
    loader.style.display = 'block';
    errorMessage.style.display = 'none';
    translationContent.innerHTML = '';

    // Escuchar mensajes del service worker
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'translationStatus') {
            switch (message.status) {
                case 'loading':
                    loader.style.display = 'block';
                    errorMessage.style.display = 'none';
                    translationContent.innerHTML = '';
                    break;
                
                case 'success':
                    loader.style.display = 'none';
                    errorMessage.style.display = 'none';
                    translationContent.innerHTML = message.translation;
                    break;
                
                case 'error':
                    loader.style.display = 'none';
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = message.error;
                    break;
            }
        }
    });
}); 
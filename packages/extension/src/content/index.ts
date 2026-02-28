// Signal to the web app that this extension is installed
document.documentElement.setAttribute('data-whiteboard-ext', 'true');

// Custom event listener for the web app to trigger a sync
window.addEventListener('WHITEBOARD_SYNC_REQUEST', async () => {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_PENDING_CAPTURES' });
    if (response && response.length > 0) {
      console.log(`[Content Script] Received ${response.length} captures, dispatching to app.`);
      window.dispatchEvent(new CustomEvent('WHITEBOARD_SYNC_RESPONSE', { 
        detail: response 
      }));
    }
  } catch (error) {
    console.warn('[Content Script] Sync failed (extension might be reloaded):', error);
  }
});

// Also check on load
(async () => {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_PENDING_CAPTURES' });
    if (response && response.length > 0) {
      window.dispatchEvent(new CustomEvent('WHITEBOARD_SYNC_RESPONSE', { 
        detail: response 
      }));
    }
  } catch (e) {}
})();

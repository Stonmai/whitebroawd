// Custom event listener for the web app to trigger a sync
window.addEventListener('WHITEBOARD_SYNC_REQUEST', async () => {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_PENDING_CAPTURES' });
    if (response) {
      window.dispatchEvent(new CustomEvent('WHITEBOARD_SYNC_RESPONSE', { 
        detail: response 
      }));
    }
  } catch (error) {
    console.error('Sync request failed:', error);
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

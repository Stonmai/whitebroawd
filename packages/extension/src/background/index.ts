chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_TAB') {
    captureTab(message.tags).then(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'CAPTURE_ALL_TABS') {
    captureAllTabs().then(sendResponse);
    return true;
  }

  if (message.type === 'GET_PENDING_CAPTURES') {
    getAndClearPendingCaptures().then(sendResponse);
    return true;
  }
});

async function getAndClearPendingCaptures() {
  const { pendingCaptures = [] } = await chrome.storage.local.get('pendingCaptures');
  if (pendingCaptures.length > 0) {
    console.log(`[Background] Sending ${pendingCaptures.length} captures to whiteboard.`);
    await chrome.storage.local.set({ pendingCaptures: [] });
  }
  return pendingCaptures;
}

async function captureTab(tags?: string[]) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error('No active tab found');

    const screenshot = await chrome.tabs.captureVisibleTab({ format: 'jpeg', quality: 80 });
    const metadata = await extractMetadata(tab.id!);

    const captureData = {
      title: tab.title,
      url: tab.url,
      favicon: tab.favIconUrl,
      screenshot: screenshot,
      description: metadata?.description || '',
      ogImage: metadata?.ogImage || '',
      tags: tags || [],
      timestamp: new Date().toISOString()
    };

    // Store in storage.local for web app to pick up
    const { pendingCaptures = [] } = await chrome.storage.local.get('pendingCaptures');
    const updatedCaptures = [...pendingCaptures, captureData];
    await chrome.storage.local.set({ 
      pendingCaptures: updatedCaptures 
    });

    console.log('[Background] Capture successful. Pending count:', updatedCaptures.length);
    return { success: true, count: 1 };
  } catch (error: any) {
    console.error('Capture failed:', error);
    return { success: false, error: error.message };
  }
}

async function captureAllTabs() {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    let count = 0;

    for (const tab of tabs) {
      if (!tab.url?.startsWith('http') || tab.url.includes('chrome://')) continue;
      if (tab.url.match(/localhost:(3000|3001|3002|3003|3004|3005)/)) continue;
      if (tab.url.includes('whitebroawd-web.vercel.app')) continue;
      
      // For batch capture, we might skip screenshots to save performance or only capture active one
      // Here we'll just capture metadata for simplicity or try to switch tabs quickly
      const metadata = await extractMetadata(tab.id!);
      
      const captureData = {
        title: tab.title,
        url: tab.url,
        favicon: tab.favIconUrl,
        description: metadata?.description || '',
        ogImage: metadata?.ogImage || '',
        timestamp: new Date().toISOString()
      };

      const { pendingCaptures = [] } = await chrome.storage.local.get('pendingCaptures');
      await chrome.storage.local.set({ 
        pendingCaptures: [...pendingCaptures, captureData] 
      });
      count++;
    }

    return { success: true, count };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function extractMetadata(tabId: number) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const getMeta = (name: string) => 
          document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ||
          document.querySelector(`meta[property="${name}"]`)?.getAttribute('content');

        return {
          description: getMeta('description') || getMeta('og:description') || '',
          ogImage: getMeta('og:image') || '',
        };
      }
    });

    return results[0].result;
  } catch (e) {
    return { description: '', ogImage: '' };
  }
}

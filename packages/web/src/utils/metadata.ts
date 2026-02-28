import { WhiteboardNode } from '@whiteboard/shared/types';

export const fetchMetadata = async (url: string): Promise<Partial<WhiteboardNode['data']>> => {
  try {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=true`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Microlink API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'success' && result.data) {
      const { data } = result;
      return {
        title: data.title || '',
        description: data.description || '',
        favicon: data.logo?.url || data.icon?.url || '',
        screenshot: data.screenshot?.url || data.image?.url || '',
      };
    }
  } catch (error) {
    console.warn('Metadata fetch failed, using fallback:', error);
  }
  
  // Return a fallback based on the domain if the API fails
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return {
      title: domain.charAt(0).toUpperCase() + domain.slice(1),
      url: url,
    };
  } catch (e) {
    return { title: 'New Bookmark', url };
  }
};

/**
 * Universal clipboard utility that works in both Electron and web environments
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  // Check if we're in Electron and use its clipboard API
  if (typeof window !== 'undefined' && (window as any).electronApi?.copyToClipboard) {
    try {
      const result = await (window as any).electronApi.copyToClipboard(text);
      if (!result.success) {
        throw new Error(result.error || 'Failed to copy to clipboard');
      }
      return;
    } catch (error) {
      console.error('Electron clipboard failed:', error);
      // Fall back to web clipboard API
    }
  }

  // Fallback to web clipboard API
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Web clipboard failed:', error);
      throw new Error('Failed to copy to clipboard. Your browser may not support this feature.');
    }
  } else {
    throw new Error('Your browser does not support clipboard API');
  }
};

export const getHostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
};

export const isValidURL = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const copyShareLinkToClipboard = (subplebbitAddress: string, cid: string) => {
  const shareLink = `https://pleb.bz/p/${subplebbitAddress}/c/${cid}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareLink);
  } else {
    alert('Your browser does not support clipboard API');
  }
};

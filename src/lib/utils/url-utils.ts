import { copyToClipboard } from './clipboard-utils';

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

export const copyShareLinkToClipboard = async (subplebbitAddress: string, cid: string) => {
  const shareLink = `https://pleb.bz/p/${subplebbitAddress}/c/${cid}`;
  await copyToClipboard(shareLink);
};

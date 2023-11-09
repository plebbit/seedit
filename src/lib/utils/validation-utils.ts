export const isValidENS = (address: string) => {
  return address.endsWith('.eth');
};

export const isValidIPFS = (address: string) => {
  const IPFS_REGEX = /^12D3KooW[A-Za-z0-9]+$/;
  return IPFS_REGEX.test(address) && address.length === 52;
};

export const isValidURL = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
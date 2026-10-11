// The desktop app's Kubo node runs AutoNAT, which tests whether peers on the internet can dial it.
// A node behind NAT without port forwarding reports Private: it can still dial out, but browsers
// cannot connect to it, so communities it hosts do not load in a browser.
export const KUBO_API_URL = 'http://127.0.0.1:50019/api/v0';

const REACHABILITY_VALUES = { public: 'public', private: 'private' };

export const parseNodeReachability = (autonatResponse) => {
  const reachability = typeof autonatResponse?.reachability === 'string' ? autonatResponse.reachability.toLowerCase() : '';
  return REACHABILITY_VALUES[reachability] ?? 'unknown';
};

export const getNodeReachability = async ({ apiUrl = KUBO_API_URL, fetchImpl = fetch, timeoutMs = 5000 } = {}) => {
  try {
    const response = await fetchImpl(`${apiUrl}/swarm/addrs/autonat`, { method: 'POST', signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) {
      return 'unknown';
    }
    return parseNodeReachability(await response.json());
  } catch {
    return 'unknown';
  }
};

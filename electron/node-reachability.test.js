import { describe, expect, it, vi } from 'vitest';
import { getNodeReachability, parseNodeReachability } from './node-reachability.js';

const jsonResponse = (body, ok = true) => ({ ok, json: async () => body });

describe('node reachability', () => {
  it('maps Kubo AutoNAT reachability to public, private, or unknown', () => {
    expect(parseNodeReachability({ reachability: 'Public' })).toBe('public');
    expect(parseNodeReachability({ reachability: 'Private', nat: 'double-nat' })).toBe('private');
    expect(parseNodeReachability({ reachability: 'Unknown' })).toBe('unknown');
    expect(parseNodeReachability(undefined)).toBe('unknown');
  });

  it('asks the local Kubo API and treats failures as unknown', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ reachability: 'Private' }));

    await expect(getNodeReachability({ fetchImpl })).resolves.toBe('private');
    expect(fetchImpl).toHaveBeenCalledWith('http://127.0.0.1:50019/api/v0/swarm/addrs/autonat', expect.objectContaining({ method: 'POST' }));

    await expect(getNodeReachability({ fetchImpl: vi.fn().mockResolvedValue(jsonResponse({}, false)) })).resolves.toBe('unknown');
    await expect(getNodeReachability({ fetchImpl: vi.fn().mockRejectedValue(new Error('ECONNREFUSED')) })).resolves.toBe('unknown');
  });
});

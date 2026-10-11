// @vitest-environment jsdom

import * as React from 'react';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useNodeReachabilityStore from '../../stores/use-node-reachability-store';
import CommunityReachabilityAlert from './community-reachability-alert';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const act = (React as { act?: (callback: () => void | Promise<void>) => void | Promise<void> }).act as (callback: () => void | Promise<void>) => void | Promise<void>;

const testState = vi.hoisted(() => ({
  rpcUrls: ['ws://localhost:9138'] as string[] | undefined,
}));

vi.mock('@bitsocial/bitsocial-react-hooks', () => ({
  useAccount: () => ({ pkcOptions: { pkcRpcClientsOptions: testState.rpcUrls } }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('CommunityReachabilityAlert', () => {
  let container: HTMLDivElement;
  let root: Root;
  let getNodeReachability: ReturnType<typeof vi.fn>;

  const render = async (isHostedHere: boolean) => {
    await act(async () => root.render(createElement(CommunityReachabilityAlert, { className: 'alert', isHostedHere })));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  };

  beforeEach(() => {
    useNodeReachabilityStore.setState({ reachability: 'unknown', checkedAt: undefined });
    testState.rpcUrls = ['ws://localhost:9138'];
    getNodeReachability = vi.fn().mockResolvedValue('private');
    window.electronApi = { isElectron: true, getNodeReachability } as unknown as typeof window.electronApi;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.electronApi = undefined;
    vi.useRealTimers();
  });

  it('warns the owner when the node hosting this community is not reachable from the internet', async () => {
    await render(true);

    expect(container.querySelector('[role="status"]')?.textContent).toBe('community_unreachable_from_browsers');
    expect(getNodeReachability).toHaveBeenCalledOnce();
  });

  it('keeps the warning when the sidebar remounts on navigation, without asking the node again', async () => {
    await render(true);
    act(() => root.unmount());
    root = createRoot(container);
    await render(true);

    expect(container.textContent).toBe('community_unreachable_from_browsers');
    expect(getNodeReachability).toHaveBeenCalledOnce();
  });

  it.each(['public', 'unknown'])('stays hidden when the node reachability is %s', async (reachability) => {
    getNodeReachability.mockResolvedValue(reachability);
    await render(true);

    expect(container.textContent).toBe('');
  });

  it('keeps asking the node, because its verdict arrives minutes after startup', async () => {
    vi.useFakeTimers();
    getNodeReachability.mockResolvedValueOnce('unknown').mockResolvedValue('private');
    await act(async () => root.render(createElement(CommunityReachabilityAlert, { className: 'alert', isHostedHere: true })));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(container.textContent).toBe('');
    expect(getNodeReachability).toHaveBeenCalledOnce();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(container.textContent).toBe('community_unreachable_from_browsers');
    expect(getNodeReachability).toHaveBeenCalledTimes(2);
  });

  it('does not check communities hosted elsewhere or accounts using another node', async () => {
    await render(false);
    expect(container.textContent).toBe('');

    testState.rpcUrls = ['ws://203.0.113.5:9138/secret'];
    await render(true);
    expect(container.textContent).toBe('');
    expect(getNodeReachability).not.toHaveBeenCalled();
  });

  it('does nothing outside the desktop app', async () => {
    window.electronApi = undefined;
    await render(true);

    expect(container.textContent).toBe('');
  });
});

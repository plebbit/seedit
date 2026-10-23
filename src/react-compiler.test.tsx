// @vitest-environment jsdom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import LoadingEllipsis from './components/loading-ellipsis';

const compilerRuntime = vi.hoisted(() => ({ cacheCalls: 0 }));

vi.mock('react/compiler-runtime', async (importOriginal) => {
  // @types/react intentionally omits this runtime's exports.
  const actual = await importOriginal<{ c: (size: number) => unknown[] }>();
  return {
    ...actual,
    c: (size: number) => {
      compilerRuntime.cacheCalls++;
      return actual.c(size);
    },
  };
});

// Vitest transforms app code with vite.config.js, so this fails when a plugin change stops the React Compiler,
// as @vitejs/plugin-react 6 did by silently dropping its `babel` option.
describe('React Compiler', () => {
  it('compiles app components', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => root.render(<LoadingEllipsis string='loading feed' />));

    expect(container.textContent).toBe('loading feed');
    expect(compilerRuntime.cacheCalls).toBeGreaterThan(0);
    await act(async () => root.unmount());
  });
});

import { describe, it, expect } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

describe('smoke apk', () => {
  it('renderiza a home sem crash', async () => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const errors: string[] = [];
    window.addEventListener('error', (e) => errors.push(String((e as ErrorEvent).message || e)));
    window.addEventListener('unhandledrejection', (e) => errors.push(String((e as PromiseRejectionEvent).reason)));
    const div = document.createElement('div');
    document.body.appendChild(div);
    await act(async () => {
      createRoot(div).render(<App />);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 800));
    });
    expect(errors).toEqual([]);
    expect(div.innerHTML).toContain('Escolha uma leitura');
  });
});

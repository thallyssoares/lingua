import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

function bootLog(msg: string): void {
  try {
    const el = document.getElementById('bootlog');
    if (el) el.textContent += `\n${msg}`;
  } catch {
    /* DOM indisponível */
  }
}

bootLog('passo 1: js executou');
window.addEventListener('error', (e) => bootLog(`ERRO: ${String((e as ErrorEvent).message || e)}`));
window.addEventListener('unhandledrejection', (e) => bootLog(`PROMESSA: ${String((e as PromiseRejectionEvent).reason)}`));
bootLog('passo 2: monitor de erros ok');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
bootLog('passo 3: render chamado');

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    bootLog('passo 4: tela pintou — ok');
    const el = document.getElementById('bootlog');
    if (el) el.style.display = 'none';
  });
});

# Lingua V1

PWA mobile-first de leitura graduada, vocabulário contextual e revisão espaçada para inglês, alemão, espanhol e russo.

## Executar

```bash
npm install
npm run dev
```

Para validar produção:

```bash
npm run build
npm test
```

## O que está funcional

- Lote editorial real com 344 textos não repetidos: alemão (129), espanhol (115), russo (70) e inglês (30, foco em C1), em níveis A1–C1 e temas variados. Cada item registra fonte e URL no banco. Novos lotes entram via `node scripts/bulk-ingest.mjs scripts/seed-loteN.json` (só URLs, vocabulário e tradução automáticos) e `node scripts/fill-gaps.mjs` para completar lacunas.
- 2408 entradas de vocabulário contextual traduzidas para pt-BR, com lema, classe gramatical, frase exata do texto e pronúncia aproximada no russo. O validador confirma que toda forma cadastrada aparece literalmente no texto clicável.
- Palavras individualmente clicáveis com vocabulário contextual local, frase, TTS e salvamento de card.
- Seleção de frase, TTS por idioma via Web Speech API e fallback seguro quando indisponível.
- IndexedDB para cards e configurações, sem backend, login, IA ou APIs externas.
- Revisão com SM-2 simplificado fiel, incluindo Errei, Difícil, Bom e Fácil.
- Metas diárias, streak local, filtros de idioma/nível/tema e módulo de alfabeto cirílico.
- Exportação CSV compatível com Anki: Front, Back, Language, Level e Tags.
- Manifest, service worker, cache offline e `manus-routes.json`.

O próximo lote deve ser adicionado ao manifesto editorial e passar pela mesma auditoria; o banco ativo não contém mais os textos sintéticos repetidos da demonstração anterior.

O servidor de desenvolvimento usa `0.0.0.0` para acesso no celular dentro do ambiente de execução.

## Atualizar textos sem rebuild (OTA)

Rebuild/reinstalação só é preciso quando muda **código** do app. Conteúdo novo entra pelo próprio app, offline depois de sincronizado:

```bash
node scripts/bulk-ingest.mjs scripts/seed-loteN.json  # gera textos
node scripts/publish-content.mjs                       # gera sync/manifest.json + texts/
node scripts/pack-content.mjs                          # gera sync/lingua-pack.json (arquivo único)
```

Depois, no celular em **Ajustes → Atualização de conteúdo**, uma das opções:

1. **Rede local (sem hospedagem):** `node scripts/serve-sync.mjs` no PC e colar no app a URL `http://SEU-IP:8080/manifest.json` (mesmo Wi-Fi).
2. **Arquivo (100% offline):** mandar `sync/lingua-pack.json` por USB/WhatsApp e importar pelo app.
3. **Hospedagem (opcional):** subir `sync/` a GitHub Pages/R2/Netlify e colar a URL pública uma única vez.

Textos sincronizados ficam no IndexedDB e têm prioridade sobre o bundle embutido.

## Atualizar o app sem WhatsApp (self-update)

```bash
npm run apk:release -- "notas da versão"
git add -A
git commit -m "release"
git push
```

Isso sobe a versão (`versionCode` auto-incrementado), builda o APK e publica
`sync/apk/version.json` + `sync/apk/lingua-N.apk` na Netlify. No celular, o app
avisa sozinho quando abre (ou em **Ajustes → Atualização do app**) e o botão
**Baixar e instalar** abre o instalador do Android. Último envio manual: a
versão que estreia o updater (depois ela se atualiza sozinha).

## APK Android offline

O projeto também possui uma camada Capacitor Android. O APK inclui o bundle web local e não precisa de servidor, domínio ou backend para funcionar depois de instalado.

APK debug gerado:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Para instalar no Android, transfira o arquivo para o aparelho e abra-o. O Android pode solicitar a permissão de instalação de fontes desconhecidas.

Para recompilar em uma máquina com JDK e Android SDK configurados:

```bash
npm run android:build:debug
```

A conversão inclui:

- TTS nativo Android via Capacitor, com fallback para Web Speech no navegador;
- botão Back do Android fechando palavra, frase e leitor antes de sair;
- ícone Lingua e splash screen;
- IndexedDB e os textos empacotados dentro do APK;
- plugins Capacitor sincronizados em `android/`.

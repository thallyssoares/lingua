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

- Lote editorial real inicial com 20 textos não repetidos: inglês (5), alemão (5), espanhol (5) e russo (5), em níveis A1–C1 e temas variados. Cada item registra fonte e URL no banco.
- 140 entradas de vocabulário contextual traduzidas para pt-BR, com lema, classe gramatical, frase exata do texto e pronúncia aproximada no russo. O validador confirma que toda forma cadastrada aparece literalmente no texto clicável.
- Palavras individualmente clicáveis com vocabulário contextual local, frase, TTS e salvamento de card.
- Seleção de frase, TTS por idioma via Web Speech API e fallback seguro quando indisponível.
- IndexedDB para cards e configurações, sem backend, login, IA ou APIs externas.
- Revisão com SM-2 simplificado fiel, incluindo Errei, Difícil, Bom e Fácil.
- Metas diárias, streak local, filtros de idioma/nível/tema e módulo de alfabeto cirílico.
- Exportação CSV compatível com Anki: Front, Back, Language, Level e Tags.
- Manifest, service worker, cache offline e `manus-routes.json`.

O próximo lote deve ser adicionado ao manifesto editorial e passar pela mesma auditoria; o banco ativo não contém mais os textos sintéticos repetidos da demonstração anterior.

O servidor de desenvolvimento usa `0.0.0.0` para acesso no celular dentro do ambiente de execução.

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

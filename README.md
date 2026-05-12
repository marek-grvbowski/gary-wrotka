# Gary Wrotka — strona marki

Statyczna strona dla rzemieślniczej marki fermentów (kombucha, sosy, octy).
Astro 6 + Tailwind v4 + MDX, deploy na Cloudflare Pages, panel CMS pod `/admin` (Sveltia CMS).

## Stos

- **Astro 6** — generator statyczny
- **Tailwind CSS v4** — stylowanie
- **MDX** — wpisy bloga
- **Sveltia CMS** — drag-and-drop CMS dla nietechnicznych właścicieli (client-side, GitHub OAuth)
- **Web3Forms** — backend formularzy (zamówienia, kontakt, B2B). Darmowe 250 zgłoszeń/mc.

## Pierwsze uruchomienie

```bash
npm install
cp .env.example .env
# wklej PUBLIC_WEB3FORMS_KEY (z https://web3forms.com/)
npm run dev
```

Otwórz `http://localhost:4321`.

## Komendy

| Komenda            | Działanie                                                |
| :----------------- | :------------------------------------------------------- |
| `npm install`      | Instalacja zależności                                    |
| `npm run dev`      | Dev server na `localhost:4321`                           |
| `npm run build`    | Build do `./dist/`                                       |
| `npm run preview`  | Lokalny podgląd buildu                                   |

## Struktura

```
public/
├── admin/                     # Sveltia CMS (panel zarządzania treścią)
│   ├── index.html
│   └── config.yml             # definicja kolekcji (produkty, blog, ustawienia)
├── images/
│   ├── hero/                  # zdjęcia hero carousela (6× placeholder.svg, do podmiany)
│   ├── products/              # zdjęcia produktów (placeholder.svg per slug)
│   ├── blog/                  # zdjęcia cover wpisów
│   ├── brand/                 # logo (light/dark/original)
│   └── uploads/                # pliki dodawane przez CMS
└── favicon.svg

src/
├── components/                # wspólne komponenty .astro
├── content/
│   ├── blog/*.mdx             # wpisy bloga
│   ├── products/*.md          # karty produktów
│   └── site/site.json         # globalne dane marki (nazwa, kontakt, hero...)
├── layouts/Layout.astro       # shell HTML + nawigacja + stopka
├── pages/                     # routing
│   ├── index.astro            # home (hero + manifest + featured + proces + blog + B2B CTA)
│   ├── katalog/               # lista + karta produktu
│   ├── blog/                  # lista + wpis
│   ├── b2b.astro              # landing B2B (3 sekcje: USP / partnerzy / 2 formularze)
│   ├── zamowienie.astro       # koszyk + formularz
│   ├── o-nas.astro            # historia + galeria
│   └── kontakt.astro          # dane + formularz
├── scripts/inquiry-cart.ts    # koszyk w localStorage (czysty TS)
└── styles/global.css          # tokens marki + Tailwind imports
```

## Jak właściciel zarządza treścią (panel CMS)

### Tryb lokalny (do nauki, bez gita)

```bash
npm run dev
```

Otwórz **`http://localhost:4321/admin/index.html`** (w devie potrzebny pełny `index.html`, w produkcji wystarczy `/admin/`). Edycja produktów, bloga, ustawień globalnych przez UI. Zmiany lądują w plikach `src/content/*` lokalnie — żeby wyszły na produkcję, trzeba je commitować i pushować do GitHuba.

### Tryb produkcyjny (GitHub OAuth, własny proxy na Vercelu)

Mamy własny OAuth proxy w `api/auth.js` + `api/callback.js` (Vercel Serverless Functions). Żeby zadziałało:

1. **Założyć GitHub OAuth app**
   - GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
   - Application name: `Gary Wrotka CMS` (cokolwiek)
   - Homepage URL: `https://gary-wrotka.vercel.app`
   - **Authorization callback URL**: `https://gary-wrotka.vercel.app/api/callback`
   - **Register application** → przepisać `Client ID`, wygenerować i przepisać `Client Secret`

2. **Wkleić do Vercel Environment Variables** (Project Settings → Environment Variables):
   - `GITHUB_OAUTH_CLIENT_ID` = Client ID z GitHuba
   - `GITHUB_OAUTH_CLIENT_SECRET` = Client Secret z GitHuba
   - Plus już ustawiony `PUBLIC_WEB3FORMS_KEY`
   - **Redeploy** projektu (Deployments → … → Redeploy)

3. **Sprawdź**: właściciel wchodzi na `https://gary-wrotka.vercel.app/admin/`, klika *Login with GitHub*, autoryzuje aplikację, edytuje treści, klika *Publish*. Sveltia commituje do `main`, Vercel buduje automatycznie.

> Cały kod proxy jest w repo (`api/auth.js`, `api/callback.js`) — nic płatnego ani trzeciego konta nie potrzeba.

## Jak dodać produkt ręcznie

Stwórz plik `src/content/products/nazwa-produktu.md`:

```yaml
---
name: "Nazwa produktu"
category: kombucha   # lub: sos, ocet
flavor: "krótki opis smaku"
volume: "330 ml"
shortDescription: "Jedno zdanie do karty katalogowej."
ingredients:
  - "składnik 1"
  - "składnik 2"
images:
  - "/images/products/nazwa-produktu-1.svg"
  - "/images/products/nazwa-produktu-2.svg"
available: true
featured: false      # true = pokaż na home
order: 10            # mniejsza = wcześniej w katalogu
---

Pełny opis w markdown. Dowolnie długi.
```

Wrzuć zdjęcia do `public/images/products/`. Restart dev servera (jeśli był uruchomiony).

## Jak dodać wpis bloga ręcznie

Stwórz plik `src/content/blog/slug-wpisu.mdx`:

```yaml
---
title: "Tytuł wpisu"
description: "Krótki opis (max 160 znaków, używany w SEO)."
pubDate: 2026-05-15
author: "Studio Wro"
cover: "/images/blog/slug-wpisu.jpg"
tags: ["fermentacja"]
draft: false
---

Treść w MDX — możesz importować komponenty Astro, np.:

import PhotoGallery from '../../components/PhotoGallery.astro';

<PhotoGallery images={["/images/blog/1.jpg", "/images/blog/2.jpg"]} />
```

## Konfiguracja Web3Forms

1. Załóż konto na [web3forms.com](https://web3forms.com/) (darmowe, bez karty).
2. Wygeneruj access key.
3. Wklej do `.env`:
   ```
   PUBLIC_WEB3FORMS_KEY=twoj-klucz
   ```
4. W panelu Web3Forms ustaw e-mail docelowy — tam będą lądować zamówienia, kontakty, B2B.

## Deploy na Vercel

1. Wrzuć repo na GitHuba (już zrobione: `marek-grvbowski/gary-wrotka`).
2. https://vercel.com/new → Import Git Repository → wybierz `gary-wrotka`.
3. Framework preset: Astro (wykryje sam). Build command `npm run build`, output `dist`.
4. Environment Variables:
   - `PUBLIC_WEB3FORMS_KEY` — klucz Web3Forms
   - `GITHUB_OAUTH_CLIENT_ID` — z OAuth App (dla CMS w produkcji)
   - `GITHUB_OAUTH_CLIENT_SECRET` — z OAuth App
5. Deploy. Każdy `git push` na `main` → automatyczny redeploy.

### Alternatywnie: Cloudflare Pages
Build/output identyczne (`npm run build` / `dist`). Proxy CMS-a (`api/auth.js`, `api/callback.js`) jest specyficzny dla Vercela — na CF Pages trzeba portować do CF Workers albo użyć Netlify Identity jako proxy.

## Wymagania
- Node.js >= 22.12

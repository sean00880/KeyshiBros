# KeyshiBros Ecosystem

> **Status**: Alpha | **Stack**: Next.js 16, React 19, Spline 3D, Tailwind 4
> **Category**: Gaming + Crypto | **Parent**: GROWSZ Biosphere (L1 Ecosystem)

## What is KeyshiBros?

Keyshi Bros is a **crypto-powered arcade gaming platform** with real token rewards, presale mechanics, and MEMELinked social integration. It's designed as a **content primitive** within the GROWSZ biosphere — gameplay drives engagement, tokens drive economics, rewards drive retention, referrals drive growth.

## Architecture

```
KeyshiBros (Ecosystem)
├── Landing Page       — Conversion engine with Spline 3D hero
├── Presale Module     — Wallet + Fiat (Stripe) dual-entry
├── Rewards Dashboard  — Holdings, earnings, claims, leaderboard
├── Tokenomics         — Smart contract integration (Vault + Distributor)
└── MEMELinked Bridge  — Social + NormieTool referral integration
```

## Design System

Uses **GROWSZ DesignOS** with `keyshi-bros` scope tokens:
- **Primary**: Neon cyan (#00F0FF) — gaming identity
- **Secondary**: Electric magenta (#FF00E5) — accent/CTA
- **Theme**: Dark-first, glassmorphism + holographic effects
- **3D**: Spline scenes for hero and interactive sections
- **Motion**: Framer Motion for transitions, Spline for 3D animation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS 4 |
| 3D | Spline (@splinetool/react-spline) |
| Animation | Framer Motion 12 |
| Auth | SIWX (OAuth-first, wallet-attach) |
| Payments | Stripe (fiat) + Smart Contracts (crypto) |
| Backend | GROWSZ Backend Suite (Dbity + Orcbase) |
| Analytics | ClickHouse (via MEMELinked) |

## Commands

```bash
cd ecosystems/KeyshiBros
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm type-check
```

## Key Rules

1. **Dark-first design** — all components must look premium in dark mode first
2. **Spline scenes** — lazy-loaded with Suspense, SSR disabled via dynamic import
3. **No hardcoded economics** — all splits via Commerce OS policy packs
4. **SIWX identity** — OAuth first, wallet attach for crypto features
5. **DesignOS tokens** — use `keyshi-bros` scope from design-tokens.json
6. **Gaming aesthetic** — glassmorphism, neon accents, holographic gradients, particle effects

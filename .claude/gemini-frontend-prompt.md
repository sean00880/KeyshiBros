# Gemini Frontend Lane — KeyshiBros Atomic Execution Prompt

> This prompt is loaded into Gemini CLI for frontend BUILD execution.
> DesignOS v2 context: gaming template, taste-skills loaded, Spline 3D active.

---

## SCOPE

KeyshiBros Landing Page + Presale + Rewards Dashboard
Next.js 16 App Router | ecosystems/KeyshiBros/

## MODE

BUILD (frontend only — no backend mutations)

## DESIGNOS CONFIG

- **Template**: gaming
- **taste-skills**: design-taste-frontend, high-end-visual-design, full-output-enforcement
- **Motion intensity**: 8/10
- **Visual density**: 5/10
- **Design variance**: 6/10
- **3D**: Spline (@splinetool/react-spline)
- **Asset gen**: Nano Banana 2.0 (gemini-3.1-flash-image-preview)
- **Dark mode only**: true

## COLOR SYSTEM (from design-tokens.json keyshi-bros scope)

| Token | Value | Usage |
|-------|-------|-------|
| bg | #050508 | Page background |
| fg | #e8eaed | Primary text |
| primary | #00f0ff | Neon cyan — CTAs, active states |
| secondary | #ff00e5 | Electric magenta — secondary accent |
| tertiary | #7c3aed | Purple — tertiary accent |
| success/up | #00ff88 | Positive indicators |
| danger/down | #ff3366 | Negative indicators |
| gold | #ffd700 | Prestige, rewards |
| card | #0d0d16 | Card backgrounds |
| surface | #0a0a12 | Elevated surfaces |
| border | #1a1a2e | Default borders |
| muted-fg | #6b7280 | Secondary text |

## TYPOGRAPHY

- **Headings**: Space Grotesk (variable: --font-heading)
- **Mono/Data**: JetBrains Mono (variable: --font-mono)
- **Body**: Space Grotesk (same as heading)

## EFFECTS ENABLED

1. Glassmorphism — `backdrop-filter: blur(24px) saturate(1.4)`, rgba(13,13,22,0.6)
2. Holographic gradient — `linear-gradient(135deg, primary, secondary, tertiary)`
3. Neon glow — `box-shadow: 0 0 20px {color}40`
4. Grid background — 60px grid with 3% accent opacity
5. Particle system (CSS-based glow dots)
6. Scanline CRT overlay (optional, subtle)

## SECTIONS TO BUILD

### 1. Hero Section
- Full viewport height
- Spline 3D scene as background (dynamic import, SSR: false)
- Gradient overlay (from-kb-bg via-kb-bg/60 to-transparent)
- Title: "Play. Earn. Dominate." — holographic gradient text
- Subtitle: descriptive, muted
- 3 CTAs: Enter Presale (primary), Connect Wallet (secondary), Download App (ghost)
- Stats bar: Total Raised, Token Price, Holders
- Framer Motion stagger entrance

### 2. Ecosystem Orbit
- Center: animated logo/mascot placeholder (circular, neon border)
- 5 orbit nodes at equal angles: Gameplay, Rewards, Tokenomics, AI+Social, Leaderboards
- Each node: icon + label, clickable
- On click: glassmorphic detail panel slides in below
- Framer Motion hover scale + AnimatePresence for panels

### 3. Roadmap Timeline
- 6 milestones: V1 (complete), Token (active), Marketplace, Marketing, 100K, 1M
- Desktop: horizontal cards
- Mobile: vertical stack
- Scroll-triggered reveal (Framer Motion useInView)
- Active milestone: neon primary border + pulse indicator
- Complete: success color
- Upcoming: muted

### 4. Presale Module
- Two-column: tier progress (left) + purchase module (right)
- Tier progress: 4 tiers with progress bars (animated gradient fill)
- Payment mode toggle: Crypto / Card (tab-style)
- Amount selector: 6 preset buttons + custom input
- Token calculation: live update with price display
- Vesting info card
- Action button: animated, mode-dependent text
- Trust signals: Audited, LP Locked, KYC

### 5. Rewards Dashboard
- 4 stat cards: Holdings, Earned, Claimable, Rank
- Claim section: big number + claim button
- Streak + multiplier display with progress bar
- Leaderboard: 5 entries + user position highlighted
- All cards use glassmorphism

### 6. Navigation
- Sticky, glass background on scroll
- Logo: holographic "KEYSHI" + white "BROS"
- Links: Ecosystem, Roadmap, Presale, Rewards
- CTA: "Buy Now" (primary button)
- Mobile: hamburger → slide-down glass menu

### 7. Footer
- Logo + social links + copyright
- "Powered by GROWSZ" attribution

## SPLINE SCENES NEEDED (User Action Required)

Create these scenes in spline.design:

1. **Hero Scene**: Animated mascot character (Keyshi identity) with:
   - Idle animation loop
   - Mouse hover reaction
   - Floating token particles with glow
   - Neon grid floor
   - Dark void environment
   - Bloom post-processing

Export as .splinecode, update URL in `src/components/3d/spline-hero.tsx`

## NANO BANANA 2.0 IMAGE ASSETS (Generate)

Generate these using Gemini 3.1 Flash Image:

1. **Hero BG fallback** (3840x2160, 21:9):
   "Futuristic dark gaming arena, neon cyan and magenta lighting, volumetric fog, holographic displays, cyber grid floor, ultra quality, no text"

2. **OG image** (1200x630):
   "Keyshi Bros gaming banner, futuristic arcade, neon cyan and magenta, dark background, premium quality"

3. **Favicon/Logo** (512x512):
   "Futuristic gaming emblem, KB initials, holographic, neon cyan, dark background, clean vector"

## VIDEO ASSETS NEEDED (User Provides)

| Slot | Spec | Purpose |
|------|------|---------|
| Hero BG loop | 3840x2160, 10-30s, MP4 H.265 | Ambient hero background |
| Gameplay reel | 1920x1080, 15-60s, MP4 H.264 | Feature showcase section |

## REQUIREMENTS

- Use Tailwind CSS 4 (via @tailwindcss/postcss)
- All components in src/components/ — fully componentized
- Mobile + desktop responsive (375px → 1440px)
- Framer Motion for all transitions
- No backend logic — UI only
- Hooks prepared for: wallet connection, contract interaction, Stripe checkout
- All colors from CSS custom properties (no hardcoded hex in components)
- Performance: < 3s LCP, < 100ms FID

## OUTPUT FILES

```
ecosystems/KeyshiBros/
├── src/app/
│   ├── layout.tsx          ✅ Created
│   └── page.tsx            ✅ Created
├── src/components/
│   ├── 3d/spline-hero.tsx  ✅ Created
│   ├── hero/
│   │   ├── hero-section.tsx     ✅ Created
│   │   ├── ecosystem-orbit.tsx  ✅ Created
│   │   └── roadmap-timeline.tsx ✅ Created
│   ├── presale/
│   │   └── presale-module.tsx   ✅ Created
│   ├── dashboard/
│   │   └── rewards-dashboard.tsx ✅ Created
│   └── ui/
│       ├── sticky-nav.tsx       ✅ Created
│       └── footer.tsx           ✅ Created
├── src/lib/hooks/
│   ├── use-wallet.ts       ✅ Created
│   ├── use-presale.ts      ✅ Created
│   └── use-rewards.ts      ✅ Created
├── src/styles/
│   └── globals.css          ✅ Created
└── public/assets/
    └── (user-provided images/videos)
```

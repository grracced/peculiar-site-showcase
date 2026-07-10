# VerifAI - Brand Identity & Design System

> **Lead Product Designer Note:**
> The following specification establishes the foundational Brand Identity and Design System for VerifAI. Because our core product is a trust engine—verifying the authenticity of digital files via AI and blockchain (Hedera)—every visual and experiential decision has been optimized for clarity, authority, and professionalism. We are strictly avoiding the flashy, neon aesthetics often associated with crypto projects. 

---

## 1. Brand Personality
**Personality:** Authoritative, transparent, highly precise, and fundamentally secure. 

**Why it fits:** VerifAI is asking users (and enterprise auditors) to trust its verification process. The brand must feel like a modern financial institution or top-tier developer tool (like Stripe or Vercel). It should feel cold and calculated, yet accessible—never playful or whimsical.

## 2. Brand Values
1. **Immutable Truth:** Data is factual, verified, and unalterable.
2. **Seamless Usability:** Complex blockchain mechanics should be invisible to the user.
3. **Privacy First:** We don't store your secrets; we only secure the proof.
4. **Velocity:** Verification must be nearly instantaneous.

**Why it fits:** These values align perfectly with the technical architecture (Hedera's speed, SHA-256 privacy) and the business goal of creating a frictionless Web2.5 experience.

## 3. Brand Voice
**Voice:** Professional, concise, reassuring, and intelligent. 
- *We say:* "Your document is secured and anchored to the Hedera network."
- *We DO NOT say:* "Congrats! You just minted your file to the blockchain!"

**Why it fits:** We are targeting legal teams, content creators, and enterprise developers. The language must be free of crypto-jargon and focus strictly on utility and security.

## 4. Logo Direction
**Direction:** A sharp, geometric, abstract mark. A stylized combination of a document/file icon and a cryptographic block or checkmark. It must look sharp in a 16x16 favicon.
**Typography:** A bold, geometric sans-serif (e.g., Inter or Geist) tightly tracked.

**Why it fits:** Abstract geometric shapes communicate stability and technology. A simple logo ensures it works equally well in a B2B API portal or a consumer dashboard.

---

## 5. Color Palette

*The palette is strictly monochromatic with highly intentional semantic colors. We use color to communicate state, not for decoration.*

- **Primary Colors (Grayscale Foundation):**
  - `Primary-900` (Near Black): `#111111` (For primary text and Dark Mode backgrounds).
  - `Primary-500` (Neutral Grey): `#888888` (For secondary text and borders).
  - `Primary-100` (Off-White): `#FAFAFA` (For Light Mode surface backgrounds).
  - *Why:* A black-and-white foundation projects absolute confidence and minimalism. It lets the user's uploaded documents and the verification status stand out.

- **Semantic Colors (Status Indicators):**
  - **Success (Verified):** `#007A5A` (Deep, calm green). 
  - **Warning (Processing):** `#F5A623` (Standard alert amber).
  - **Danger (Tampered/Failed):** `#E00000` (Sharp, urgent red).
  - **Brand Accent / Info:** `#0070F3` (Electric blue).
  - *Why:* Semantic colors must be universally understood. When an auditor uploads a file, a massive `#007A5A` checkmark instantly communicates "Safe."

## 6. Typography
- **Primary UI Font:** `Geist` or `Inter`. Used for all headings, body text, and buttons.
- **Monospace Font:** `Geist Mono` or `JetBrains Mono`. Used explicitly for SHA-256 hashes, Hedera Transaction IDs, and API keys.

**Why it fits:** `Inter` is the gold standard for high-legibility SaaS interfaces. Using a strict Monospace font for cryptographic hashes communicates technical precision and makes comparing long alphanumeric strings much easier for auditors.

## 7. Spacing System
**System:** A strict 8-point grid system (8px, 16px, 24px, 32px, 48px, 64px), scaling down to 4px for micro-adjustments.

**Why it fits:** Using a mathematical base-8 scale ensures vertical and horizontal rhythm. It prevents the UI from feeling "messy" or misaligned, which subconsciously erodes trust.

## 8. Border Radius
**Radius:** Minimal. `4px` for small elements (inputs, buttons). `8px` for large containers (modals, cards). 

**Why it fits:** Sharp corners and small radii feel serious, technical, and structural. Large, pill-shaped buttons feel too consumer-friendly or playful for a verification engine.

## 9. Shadows
**System:** Subdued and strictly functional. 
- `Shadow-Sm`: `0 4px 6px -1px rgba(0, 0, 0, 0.05)` (For dropdowns).
- `Shadow-Md`: `0 10px 15px -3px rgba(0, 0, 0, 0.1)` (For modals).
- Instead of heavy drop shadows, rely primarily on `1px solid #EAEAEA` borders to separate elements.

**Why it fits:** Heavy drop shadows can make an interface feel muddy or dated. A flat, border-driven UI feels modern and highly organized.

## 10. Icon Style
**Style:** Line icons with a consistent `1.5px` stroke weight (e.g., Lucide Icons or Phosphor Icons). No filled or dual-tone icons (unless used as a major status indicator, like a solid green check).

**Why it fits:** Line icons preserve the minimalist, lightweight aesthetic. Consistency in stroke weight ensures the UI looks cohesive and engineered.

## 11. Illustration Style
**Style:** Abstract, geometric data representations or subtle wireframes. No human characters. No "Corporate Memphis" flat-vector people high-fiving.

**Why it fits:** The product secures data. Abstract representations of blocks, networks, or documents feel much more appropriate than generic character illustrations.

## 12. Animation Principles
**Principles:** Extremely fast, purposeful, and subtle. 
- **Durations:** `150ms` for hovers, `200ms` for modal entrances. 
- **Easing:** `ease-in-out`. No bouncy spring physics.

**Why it fits:** VerifAI promises speed. Slow or overly dramatic animations make the platform feel sluggish. A button hover should snap into place; a modal should fade in efficiently. 

## 13. Light Mode
**Environment:** The default state.
- **Background:** `#FFFFFF` (Pure white).
- **Surfaces/Cards:** `#FAFAFA` (Off-white) to create subtle depth without shadows.
- **Text:** `#111111` for high contrast.

**Why it fits:** Light mode is standard for daytime B2B utility. Pure white backgrounds ensure that uploaded documents (like PDFs) blend naturally into the reading environment.

## 14. Dark Mode
**Environment:** Fully supported as a toggle.
- **Background:** `#000000` (Pure black).
- **Surfaces/Cards:** `#111111` (Near black) with `1px #333333` borders.
- **Text:** `#EAEAEA` (Off-white to prevent eye strain).

**Why it fits:** Dark mode appeals heavily to developers (Devin the Developer persona). Pure black backgrounds allow the electric blue accent color and semantic status colors to pop brilliantly, mimicking a terminal or IDE environment.

## 15. Accessibility (WCAG)
**Standards:**
- **Contrast:** All text must meet WCAG AAA contrast ratios (at least 7:1 for body text).
- **Focus States:** Every interactive element must have a highly visible focus state (e.g., a 2px blue ring with a 2px offset) for keyboard navigation.
- **Color Blindness:** Never rely on color alone to communicate state. A "Failed" status must use red color *and* a warning icon or text label.

**Why it fits:** Accessibility is non-negotiable for enterprise software. If a government auditor or legal team cannot use the software due to poor contrast or lack of keyboard support, the product fails.

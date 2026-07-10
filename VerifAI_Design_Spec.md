# VerifAI - UI/UX Product Design Specification

> **Lead Product Designer & Senior UX Architect Note:** 
> This document translates the approved PRD and System Architecture into a comprehensive, enterprise-grade user experience design specification. It serves as the definitive reference for all frontend developers. Following the styling principles of Vercel, Stripe, and Linear, this design language prioritizes trust, clarity, and performance over flashy "crypto-native" aesthetics.

---

## 1. BRAND IDENTITY

- **Brand Personality:** Authoritative yet accessible, transparent, highly precise, and fundamentally secure.
- **Brand Voice:** Professional, concise, reassuring, and intelligent. No jargon unless necessary. We explain *why* something is secure, not just that it *is*.
- **Core Values:** Immutable Truth, Seamless Usability, Privacy, Speed.
- **Visual Identity:** Minimalist, monochromatic foundation with highly intentional use of color to indicate status (verified vs. unverified). High contrast, sharp typography, and ample negative space.
- **Brand Keywords:** Trust, Verification, Clarity, Enterprise, Immutable.
- **Logo Direction:** A sharp, geometric, abstract mark representing a document or block being secured (e.g., a stylized checkmark merging with a document or hexagon). Typography should be a geometric sans-serif (e.g., Inter or Geist).
- **Icon Style:** Line icons with a consistent 1.5px stroke weight (e.g., Lucide or Phosphor Icons). No filled or dual-tone icons except for critical alerts.
- **Illustration Style:** Subtle, abstract, geometric data representations. Wireframe-style objects. No human-character illustrations (e.g., no "corporate memphis").
- **Photography Style:** Not applicable for the MVP dashboard. If needed for the landing page, use high-contrast, abstract macro photography of glass, servers, or light trails.

---

## 2. DESIGN SYSTEM

*This system is optimized for a technical, data-heavy B2B SaaS application.*

### Colors (Vercel/Linear-inspired)
- **Primary Colors:** 
  - `Primary-900` (Near Black): `#111111`
  - `Primary-500` (Neutral Grey): `#888888`
  - `Primary-100` (Off-White): `#FAFAFA`
- **Secondary Colors (Brand Accent):**
  - `Brand-Blue`: `#0070F3` (Vercel-style blue for primary actions).
- **Semantic Colors:**
  - `Success`: `#007A5A` (Trust/Verified).
  - `Warning`: `#F5A623` (Processing/Pending).
  - `Danger`: `#E00000` (Failed/Tampered).
  - `Info`: `#0070F3` (Informational/System updates).
- **Background Colors:**
  - Light Mode: `Bg-Base`: `#FFFFFF`, `Bg-Surface`: `#FAFAFA`.
  - Dark Mode: `Bg-Base`: `#000000`, `Bg-Surface`: `#111111`.
- **Border Colors:**
  - Subtle borders: `#EAEAEA` (Light), `#333333` (Dark).

### Typography
- **Font Family:** `Geist` or `Inter` for UI. `JetBrains Mono` or `Geist Mono` for Hashes, Code, and Transaction IDs.
- **Scale:**
  - `H1`: 32px / 40px line-height (Semibold)
  - `H2`: 24px / 32px line-height (Semibold)
  - `H3`: 20px / 28px line-height (Medium)
  - `Body`: 14px / 24px line-height (Regular)
  - `Caption`: 12px / 16px line-height (Regular)

### Layout & Sizing
- **Spacing Scale:** Base-4 or Base-8 system (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px).
- **Border Radius:** Very subtle. `4px` for buttons/inputs, `8px` for cards and modals. No pill-shaped buttons.
- **Shadow System:** 
  - `Shadow-Sm`: Drop-down menus (subtle 4px blur, 5% opacity).
  - `Shadow-Md`: Modals and floating elements.
  - *Note:* UI should rely primarily on 1px borders rather than heavy shadows to delineate depth.
- **Grid System:** 12-column CSS Grid. Max width `1200px` for the dashboard content area.

### Experience
- **Dark/Light Mode:** First-class support for both. A toggle should be present in the settings. Default to system preference.
- **Animation Style:** Extremely fast and subtle. `150ms` ease-in-out for hovers, `200ms` for modal entrances. No bouncing or spring physics.
- **Accessibility (WCAG):** AAA contrast standard for text. Focus states must be distinct (2px solid blue outline with 2px offset).

---

## 3. COMPONENT LIBRARY

*Every component must be built using the design tokens defined above.*

1. **Buttons:**
   - *Primary:* Solid Black (Light mode) / Solid White (Dark mode). Used only for the main action on a screen (e.g., "Verify Document").
   - *Secondary:* Transparent with 1px border. Used for secondary actions (e.g., "Cancel", "View History").
   - *Ghost:* No border, gray text on hover. For tertiary actions.
   - *States:* Default, Hover (opacity 80%), Active (scale 0.98), Disabled (opacity 50%, not-allowed cursor), Loading (spinning circle replaces icon).
2. **Inputs:**
   - 40px height, 1px border, 4px radius. 
   - Focus state applies a 2px blue ring. Error state applies a red border and red helper text below.
3. **Cards:**
   - White background, 1px border (`#EAEAEA`), 8px radius. Used to group related information (e.g., Verification Results).
4. **Modals / Dialogs:**
   - Centered overlay with a 50% opacity black backdrop. 400px to 600px max width. Must trap focus for accessibility.
5. **Navigation / Sidebar:**
   - Vertical sidebar (240px wide). Active state indicated by a subtle gray background and bold text.
6. **Tables:**
   - Clean, borderless rows with a 1px border separating the header. Striping is avoided; hover state highlights the entire row.
7. **Badges / Status Indicators:**
   - Small, 24px height. 
   - *Verified:* Green text on faint green background with a solid green dot.
   - *Pending:* Orange text on faint orange background with a pulsing orange dot.
8. **Upload Component (Dropzone):**
   - Dashed 2px border. Grey background on drag-over. Center contains an upload icon and "Drag and drop or click to upload".
9. **Avatars:**
   - Circular. Initials displayed in a sans-serif font if no image is provided.
10. **Loaders:**
    - Minimalist 1px stroke spinning circles. For page loads, a highly subtle linear progress bar at the absolute top of the viewport (like GitHub).
11. **Tooltips:**
    - Black background, white text, 4px radius, 12px font size. Delay 200ms on hover. Crucial for explaining blockchain jargon (e.g., hovering over "HCS" explains "Hedera Consensus Service").

---

## 4. INFORMATION ARCHITECTURE

### Public Pages
- `/` - Landing Page
- `/verify` - Public Verification Portal (Drag & drop to verify without auth)
- `/about` - Technical Whitepaper / About the Tech
- `/login`, `/register`, `/forgot-password`

### Authenticated Pages (Dashboard)
- `/dashboard` - Overview (Recent activity, quick upload)
- `/dashboard/upload` - Dedicated upload and processing screen
- `/dashboard/history` - Table of all previously verified documents
- `/dashboard/document/[id]` - Detailed view of a specific verification record
- `/dashboard/settings`
  - `/profile` - Personal info
  - `/api-keys` - Developer tokens (V2)
  - `/billing` - Subscription info

---

## 5. SCREEN-BY-SCREEN DESIGN

### Landing Page
- **Purpose:** Convert visitors into users by explaining the value proposition.
- **Layout:** Hero section with a massive, bold H1. A clean screenshot of the dashboard. Three-column feature grid below. Footer.
- **Vibe:** Stripe-like precision.

### Public Verification Portal
- **Purpose:** Allow third parties (auditors, buyers) to verify a document.
- **Content:** A massive Dropzone component in the center of the screen.
- **Interactions:** User drops a file. Screen transitions to a "Computing Hash..." loader, then queries Hedera, then displays a massive green "Verified" checkmark or a red "Not Found / Tampered" warning.

### Dashboard Overview
- **Layout:** Sidebar on the left. Top header contains user avatar and breadcrumbs.
- **Content:** 
  - **Quick Upload Widget:** Top left card.
  - **Stats Row:** Total Verified, Total Processing.
  - **Recent Activity Table:** Last 5 documents processed.

### Upload & Processing Screen
- **Purpose:** The core product loop.
- **Layout:** Split view. Left side: Dropzone. Right side: Progress checklist.
- **Interactions:**
  1. Uploading file...
  2. Extracting AI Insights... (Displays skeleton loader for text)
  3. Generating SHA-256 Hash... (Displays hash instantly in monospace font)
  4. Anchoring to Hedera... (Spinner)
  5. Success! Shows the HCS Transaction ID with an external link to Hashscan.

### Document Details (`/document/[id]`)
- **Layout:** Two-column layout.
- **Left Column:** Original File Metadata (Name, Size, Date). AI Summary/Extracted data.
- **Right Column:** The "Immutable Proof" card. Displays the File Hash, Hedera Topic ID, Hedera Transaction ID, and a "Download Certificate" button.

---

## 6. USER FLOWS

**1. The "Audit" Flow (Visitor)**
*Goal: Independent verification without trusting VerifAI.*
- Visitor goes to `verifai.com/verify`.
- Drags `contract.pdf` into the dropzone.
- System hashes the file locally in the browser (for privacy/speed), sends the hash to the API.
- API queries the Hedera Mirror Node.
- Result screen shows the exact time the file was anchored and the AI metadata associated with it.

**2. The "Securing a Document" Flow (Authenticated)**
*Goal: Anchor a new file to the blockchain.*
- User clicks "New Verification".
- Selects `NDA_signed.pdf`.
- User waits 3-5 seconds while watching the processing checklist.
- Screen transitions to the Document Details page.
- User clicks "Download Certificate" to get a PDF containing the file details and Hedera tx hash.

---

## 7. RESPONSIVE DESIGN

- **Desktop (1024px+):** Sidebar is permanently visible. Tables show all columns.
- **Tablet (768px - 1024px):** Sidebar remains visible but collapses to icons only. Tables shrink or hide less critical columns (like file size).
- **Mobile (<768px):** Sidebar is hidden behind a hamburger menu in a top-nav bar. Tables convert into stacked cards. The Dropzone becomes a full-width "Tap to Upload" button.

---

## 8. MICRO INTERACTIONS

- **Upload Progress:** Instead of a generic spinner, display a fast-moving progress bar. When hashing, rapidly display random hex characters before locking into the final SHA-256 hash (hacker/cyber effect, but kept extremely minimal and professional).
- **Skeleton Screens:** Used during AI processing. Faint, pulsing gray blocks represent text that is currently being generated.
- **Copy to Clipboard:** When copying a Hash or Transaction ID, the icon transitions to a green checkmark for 2 seconds, and a subtle toast notification appears at the bottom right.
- **Hedera Confirmation:** The transaction ID fades in gracefully once confirmed by the Mirror Node.

---

## 9. DASHBOARD UX (The "Ideal" SaaS Dashboard)

The ideal dashboard avoids overwhelming the user. Since this is an MVP, we do not need complex charting libraries yet.
- **Information Hierarchy:** The most important thing is "What did I do recently?" and "How do I do more of it?".
- **Document Statuses:** Clear visual distinction between `Processing` and `Verified`. 
- **Search:** A global search bar `(Cmd + K)` that instantly filters the user's history by document name or transaction hash.

---

## 10. DESIGN TOKENS (Implementation Reference)

*Developers must use these exact variable names in CSS/Tailwind config.*

```css
--color-primary-900: #111111;
--color-primary-500: #888888;
--color-primary-100: #FAFAFA;
--color-brand-blue: #0070F3;
--color-success: #007A5A;
--color-warning: #F5A623;
--color-danger: #E00000;

--font-sans: 'Geist', 'Inter', -apple-system, sans-serif;
--font-mono: 'Geist Mono', 'JetBrains Mono', monospace;

--radius-sm: 4px;
--radius-md: 8px;

--shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

---

## 11. FUTURE DESIGN ROADMAP

- **Phase 2 (API Platform):** The design system will need to support API Key generation, usage graphs (billing charts), and technical documentation layouts.
- **Phase 3 (Enterprise):** Introduce dense data tables for bulk verification, multi-user team management screens, and highly granular permission toggles.
- **Evolution:** The monochromatic foundation allows for secondary brand colors to be introduced later without breaking the interface. As the product scales, we will introduce a component library like `Radix UI` or `shadcn/ui` to enforce these design tokens systematically.

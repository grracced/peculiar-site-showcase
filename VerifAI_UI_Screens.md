# VerifAI - UI Screens Design Specification

> **Lead Product Designer Note:**
> This document specifies the layout, composition, and flow of every major screen in the VerifAI platform. By assembling the primitive blocks defined in the Component Library, these screens are designed to provide a frictionless, enterprise-grade user experience that prioritizes clarity and trust.

---

## 1. Landing Page (`/`)
- **Purpose:** Convert visitors into users or direct third-party auditors to the public verification tool.
- **Layout:** Vertical scroll. 
  - *Header:* Logo left, Navigation right.
  - *Hero Section:* Massive typography, concise subheadline, dual Call-To-Action (CTA) buttons, and a clean mockup of the Dashboard.
  - *Value Props:* 3-column grid highlighting Speed, AI Context, and Hedera Security.
  - *Footer:* Simple links.
- **Components Used:** Navigation Bar, Buttons (Primary, Ghost), Cards (for value props).
- **User Actions:** Click "Get Started" (Primary), click "Verify a Document" (Ghost).
- **Navigation Flow:** Routes to `/register` or `/verify`.

## 2. Login (`/login`)
- **Purpose:** Authenticate returning users.
- **Layout:** Centered single-column card against a faint `Bg-Surface` background. 
- **Components Used:** Card, Inputs (Email, Password), Button (Primary, Loading state), Alerts (for failed login), Ghost Button ("Forgot Password").
- **User Actions:** Enter credentials, submit form, toggle password visibility.
- **Navigation Flow:** Success routes to `/dashboard`. "Sign Up" routes to `/register`.

## 3. Register (`/register`)
- **Purpose:** Onboard new users to the platform.
- **Layout:** Identical to Login, centered single-column card.
- **Components Used:** Card, Inputs (Name, Email, Password, Confirm Password), Button (Primary), Toast Notification (Success).
- **User Actions:** Fill out details, accept Terms of Service via checkbox, submit.
- **Navigation Flow:** Success triggers a "Verify Email" toast or routes directly to `/dashboard`.

## 4. Dashboard (`/dashboard`)
- **Purpose:** The central hub for authenticated users to view system health and recent activity.
- **Layout:** Standard SaaS layout.
  - *Left:* Fixed Sidebar.
  - *Top:* Header with User Avatar, Breadcrumbs, and Notifications bell.
  - *Main Area:* 
    - Top Row: "Quick Upload" widget (left), "System Stats" (right).
    - Bottom Row: "Recent Verifications" table spanning full width.
- **Components Used:** Sidebar, Navigation Bar, Upload Component (Compact), Cards, Table (Compact), Badges (Verified/Pending).
- **User Actions:** Drag a file into the Quick Upload widget, click a recent document to view details.
- **Navigation Flow:** Upload initiates the flow to `/dashboard/upload`. Clicking a row routes to `/dashboard/document/[id]`.

## 5. Upload Document (`/dashboard/upload`)
- **Purpose:** The dedicated, focused environment for securing a new file.
- **Layout:** Split-screen (Desktop) or Stacked (Mobile).
  - *Left/Top:* Massive, full-height Upload Dropzone.
  - *Right/Bottom:* Vertical Progress Stepper / Checklist.
- **Components Used:** Upload Component (Full-page), Progress Indicators (Stepper), Skeleton Loaders (during AI phase).
- **User Actions:** Drag and drop a file, watch the live progress indicators (AI Extraction -> SHA-256 Hashing -> Hedera Anchoring).
- **Navigation Flow:** Upon successful anchoring, automatically transitions to `/dashboard/result/[id]`.

## 6. Verification Result (`/dashboard/result/[id]`)
- **Purpose:** Immediate confirmation and celebration of a successfully secured document.
- **Layout:** Centered success card.
- **Components Used:** Card, Massive Success Icon (Green Check), Typography (H2), Monospace Text (for Transaction ID), Button (Primary: "View Details", Secondary: "Verify Another").
- **User Actions:** Read the confirmation, copy the Transaction ID.
- **Navigation Flow:** Click "View Details" to go to `/dashboard/document/[id]`.

## 7. Verification History (`/dashboard/history`)
- **Purpose:** A comprehensive, searchable ledger of every document the user has ever secured.
- **Layout:** Full-width main area.
  - *Top:* Page Title, Search Box, and "New Verification" button aligned right.
  - *Middle:* Large Data Table.
  - *Bottom:* Pagination controls.
- **Components Used:** Sidebar, Search Box, Button (Primary), Table (Full-width), Badges, Dropdown (Action menu per row), Pagination.
- **User Actions:** Search by filename, paginate through history, click row actions (View, Download PDF Certificate).
- **Navigation Flow:** Routes to specific `/dashboard/document/[id]`.

## 8. Document Details (`/dashboard/document/[id]`)
- **Purpose:** Display the complete, immutable proof and AI-extracted metadata for a specific file.
- **Layout:** Two-column grid.
  - *Left Column:* "AI Insights" Card (Extracted text/metadata).
  - *Right Column:* "Immutable Proof" Card (File Name, Size, SHA-256 Hash, Hedera Topic ID, Hedera Transaction ID).
- **Components Used:** Sidebar, Cards, Typography (Monospace for hashes), Tooltips (explaining Hedera terms), Button (Secondary: "Download Certificate").
- **User Actions:** Copy hashes to clipboard, hover over tooltips for definitions, download the PDF proof.
- **Navigation Flow:** Back button to `/dashboard/history`.

## 9. Public Verification (`/verify`)
- **Purpose:** Allow unauthenticated third parties to independently verify a document against the Hedera ledger.
- **Layout:** Extreme minimalist, single-column centered layout.
  - *Top:* Simple logo, no complex navigation.
  - *Center:* Massive Upload Dropzone.
  - *State Change:* The Dropzone is replaced by the "Verification Result" card after processing.
- **Components Used:** Upload Component (Full-page), Loading State (Spinner), Alert (Success or Danger), Card (for results).
- **User Actions:** Drop a file to see if it has been tampered with.
- **Navigation Flow:** Completely isolated flow. A ghost button links back to `/` (Home).

## 10. User Profile (`/dashboard/settings/profile`)
- **Purpose:** Manage personal information.
- **Layout:** Forms contained within a max-width center column.
- **Components Used:** Sidebar, Tabs (for switching settings categories), Inputs (Name, Email), Avatar, Button (Primary: "Save Changes").
- **User Actions:** Update name/email, change avatar, save.
- **Navigation Flow:** Remains on page. Success Toast appears on save.

## 11. Settings (`/dashboard/settings`)
- **Purpose:** Manage account-level configurations (Theme, API Keys in V2, Billing).
- **Layout:** Tabbed interface with vertical side-navigation for setting categories.
- **Components Used:** Sidebar, Tabs, Dropdown (Theme Select: Light/Dark/System), Button (Destructive: "Delete Account"), Modal (Confirmation).
- **User Actions:** Toggle Dark Mode, initiate account deletion (requires Modal confirmation).
- **Navigation Flow:** Modal traps focus. Deleting account routes to `/`.

## 12. Notifications (`/dashboard/notifications`)
- **Purpose:** View system alerts, maintenance notices, or offline processing results.
- **Layout:** Simple vertical list of notification cards.
- **Components Used:** Sidebar, Cards (Interactive), Badges (Unread).
- **User Actions:** Click notification to mark as read, click "Mark all as read".
- **Navigation Flow:** Clicking a specific notification (e.g., "File anchored successfully") routes to that document's detail page.

## 13. 404 Page (`/404`)
- **Purpose:** Gracefully handle broken links or missing documents.
- **Layout:** Centered content, heavy negative space.
- **Components Used:** Massive Typography (e.g., "404 - Ledger Entry Not Found"), Illustration (Abstract block disconnected), Button (Primary: "Back to Dashboard").
- **User Actions:** Click button to escape.
- **Navigation Flow:** Routes to `/dashboard` (if authenticated) or `/` (if unauthenticated).

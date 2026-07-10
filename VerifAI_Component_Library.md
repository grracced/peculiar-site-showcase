# VerifAI - Component Library Specification

> **Lead Product Designer Note:**
> This document translates the VerifAI Brand Identity & Design System into a comprehensive list of reusable UI components. Following the minimalist, enterprise-grade aesthetic (inspired by Vercel and Linear), these definitions ensure absolute consistency across the application. Frontend developers will use this spec to build the foundational UI kit (e.g., in React/Tailwind) before constructing complex pages.

---

## 1. Buttons
- **Purpose:** Allow users to take actions and make choices with a single tap or click.
- **Variants:**
  - *Primary:* Solid Black (`Primary-900`) background, white text. (Used for the single most important action on a screen, e.g., "Verify Document").
  - *Secondary:* Transparent background, `1px` solid border (`Primary-500`), black text. (Used for alternative actions, e.g., "Cancel").
  - *Ghost:* No border, no background. (Used for tertiary actions like "View all").
  - *Destructive:* Solid Red (`Danger`) background, white text. (Used for deleting records).
- **States:** Default, Hover (`150ms` opacity change to 80%), Active (scale `0.98`), Disabled (50% opacity, `not-allowed` cursor), Loading (spinning circle icon replaces text).
- **Accessibility:** Must have a minimum touch target of `44x44px` on mobile. `aria-label` required if the button is icon-only. Focus ring (`2px` blue) on `tab` press.
- **Usage Guidelines:** Never place two Primary buttons side-by-side. 

## 2. Inputs
- **Purpose:** Allow users to enter single-line text (e.g., email, API key names).
- **Variants:** Default, Icon-left (e.g., Search magnifying glass), Icon-right (e.g., "Eye" to reveal password).
- **States:** Default (`1px` border `#EAEAEA`), Hover (border darkens slightly), Focus (border changes to `Brand-Blue`, no drop shadow), Error (border changes to `Danger` red), Disabled (greyed out background).
- **Accessibility:** Must include an `<label>`. Placeholder text must not be relied upon as a label due to poor contrast.
- **Usage Guidelines:** Always pair with a clear, concise label above the input. Error states must feature a red helper text message below the input explaining *why* it failed.

## 3. Text Areas
- **Purpose:** Allow users to enter multi-line text (e.g., custom metadata for a verification).
- **Variants:** Fixed height, Auto-growing.
- **States:** Same as Inputs (Default, Hover, Focus, Error, Disabled).
- **Accessibility:** Same as Inputs. 
- **Usage Guidelines:** Provide a character count indicator in the bottom right corner if there is a strict length limit (e.g., "150/500").

## 4. Upload Component (Dropzone)
- **Purpose:** The core interaction mechanic of VerifAI, allowing users to select or drag-and-drop files for processing.
- **Variants:** Full-page (Public Portal), Card-sized (Dashboard widget).
- **States:** 
  - *Default:* Dashed `2px` gray border, central upload icon, text "Drag and drop or click to upload".
  - *Drag-over:* Border turns solid `Brand-Blue`, background turns faint blue (`Primary-100`).
  - *Uploading:* Displays a progress bar and file name.
  - *Error:* Border turns red, displays "File too large or format unsupported".
- **Accessibility:** The entire dropzone must be clickable and focusable via keyboard (`Enter` opens file dialog).
- **Usage Guidelines:** Clearly state the accepted file types (e.g., "PDF, DOCX, TXT") and the maximum file size (e.g., "Max 10MB") inside the dropzone area.

## 5. Cards
- **Purpose:** Group related information into a digestible, contained format.
- **Variants:** Standard (white bg, `1px` border, `8px` radius), Highlighted (subtle blue border for focus), Interactive (scales up `1.02` on hover).
- **States:** Default, Hover (only if interactive).
- **Accessibility:** If the card acts as a link, the entire card must be wrapped in an anchor tag and navigable via keyboard.
- **Usage Guidelines:** Avoid placing cards inside of cards. Use cards to break up the dashboard (e.g., "Recent Activity" card vs. "Storage Quota" card).

## 6. Tables
- **Purpose:** Display dense, structured verification data (Hash IDs, Dates, Statuses).
- **Variants:** Full-width (Dashboard History), Compact (Quick Overview).
- **States:** Default row, Hover row (faint grey background), Selected row (checkbox ticked, faint blue background).
- **Accessibility:** Must use semantic `<th>` and `<td>` tags. Screen readers must be able to read headers before column data.
- **Usage Guidelines:** Avoid vertical borders. Use a single `1px` horizontal border below the table header. Truncate long Hashes with an ellipsis and provide a "Copy" icon.

## 7. Navigation Bar (Top Nav)
- **Purpose:** Global orientation and quick actions (mainly used on public pages or mobile).
- **Variants:** Transparent (Landing page hero), Solid White with bottom border (Dashboard top).
- **States:** Sticky (stays at top on scroll), Hidden (scroll down hides, scroll up reveals).
- **Accessibility:** Primary `nav` landmark. Must support keyboard tab ordering from left to right.
- **Usage Guidelines:** Keep it minimal. Logo on the left, primary calls-to-action (Login/Dashboard) on the right.

## 8. Sidebar
- **Purpose:** Primary navigation for the authenticated VerifAI dashboard.
- **Variants:** Expanded (Desktop, `240px`), Collapsed (Tablet, icons only, `64px`), Hidden (Mobile, toggled via hamburger).
- **States:** Active route (Bold text, faint grey background block), Inactive route (Grey text).
- **Accessibility:** Focus trap should not be applied to the sidebar unless it is opened as a mobile overlay.
- **Usage Guidelines:** Group links logically (e.g., Core features top, Settings bottom).

## 9. Dropdown
- **Purpose:** Provide a list of actions or selections without cluttering the UI.
- **Variants:** Action Menu (e.g., "three dots" next to a table row), Select Menu (choosing an option in a form).
- **States:** Closed, Open (subtle drop shadow `Shadow-Sm`, `1px` border).
- **Accessibility:** Must support `Escape` to close and arrow keys to navigate options. Focus must return to the trigger button when closed.
- **Usage Guidelines:** Keep lists short (under 10 items). If more, use a Search Box inside the dropdown.

## 10. Modal
- **Purpose:** Require the user's immediate attention and interrupt their current workflow (e.g., "Confirm Deletion").
- **Variants:** Small (Alert/Confirm), Medium (Forms/Settings), Large (Complex workflows).
- **States:** Hidden, Entering (`200ms` fade in, slight slide up), Visible.
- **Accessibility:** Must strictly trap keyboard focus inside the modal until it is closed. `Escape` key must close it. Background must have a `50%` opacity black overlay.
- **Usage Guidelines:** Use sparingly. Do not use modals for long forms; route the user to a dedicated page instead.

## 11. Dialog
- **Purpose:** A non-modal overlay, often used for complex tooltips or small contextual forms (e.g., a mini date-picker).
- **Variants:** Popover (anchored to a specific button).
- **States:** Closed, Open.
- **Accessibility:** Similar to Dropdowns; must manage focus correctly.
- **Usage Guidelines:** Use when you need to provide contextual information without blocking the rest of the UI.

## 12. Alerts
- **Purpose:** Display persistent, page-level messages that require attention.
- **Variants:** Info (Blue), Success (Green), Warning (Amber), Danger (Red).
- **States:** Static, Dismissible (contains an 'X' icon).
- **Accessibility:** Must use `role="alert"` so screen readers announce it immediately.
- **Usage Guidelines:** Place at the top of the relevant container (e.g., a warning about network latency at the top of the dashboard).

## 13. Badges
- **Purpose:** Visually label the status of an object.
- **Variants:** Verified (Green text/dot on faint green bg), Pending (Amber), Failed (Red), Neutral (Grey).
- **States:** Static. (Pending variant may have a slowly pulsing opacity on the dot).
- **Accessibility:** Text must have high contrast against the faint background.
- **Usage Guidelines:** Use inside Tables or next to Headers to instantly communicate state. Never use as clickable buttons.

## 14. Toast Notifications
- **Purpose:** Provide brief, non-interruptive feedback about an action (e.g., "Hash copied to clipboard", "Settings saved").
- **Variants:** Success, Error, Info.
- **States:** Enter (slide up from bottom right), Exit (fade out after `3000ms`).
- **Accessibility:** Use `role="status"`. Do not put critical actions inside toasts, as they disappear quickly.
- **Usage Guidelines:** Keep text under 5 words. Stack multiple toasts vertically if necessary.

## 15. Progress Indicators
- **Purpose:** Show the user that the system is working and roughly how long it will take.
- **Variants:** Linear Progress Bar (top of page), Stepper/Checklist (used during the multi-step verification process).
- **States:** 0-100% completion. Stepper states: Pending, Active, Completed, Failed.
- **Accessibility:** Provide `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes.
- **Usage Guidelines:** A Stepper/Checklist is mandatory for the Upload flow to communicate the distinct steps: AI Processing -> Hashing -> Hedera Submission.

## 16. Loading States
- **Purpose:** Inform the user that data is being fetched.
- **Variants:** Spinner (minimal `1px` stroke circle), Skeleton (faint, pulsing gray blocks that mimic the shape of the data).
- **States:** Active, Hidden.
- **Accessibility:** `aria-busy="true"` on the container being loaded.
- **Usage Guidelines:** Prefer Skeleton loaders over Spinners for layout shifts. Skeletons make the system feel faster and prevent the UI from jumping when data arrives.

## 17. Empty States
- **Purpose:** Guide the user when there is no data to display (e.g., a brand new account with no verifications).
- **Variants:** Dashboard Empty, Table Empty.
- **States:** Static.
- **Accessibility:** Ensure the message is readable and the call-to-action is clear.
- **Usage Guidelines:** An empty state must *always* contain a Call-To-Action (e.g., "You have no verifications. [Upload your first document]"). Do not just show a blank table.

## 18. Search Box
- **Purpose:** Allow users to filter or find specific records quickly.
- **Variants:** Global Search (Header), Local Search (above a specific Table).
- **States:** Default, Focus (magnifying glass icon turns blue).
- **Accessibility:** Must have `type="search"`. Keyboard shortcut (`Cmd + K` or `/`) should auto-focus the input.
- **Usage Guidelines:** Placeholder should indicate what can be searched (e.g., "Search by filename or Hash ID...").

## 19. Pagination
- **Purpose:** Allow users to navigate through large datasets (Verification History).
- **Variants:** Numbered (1, 2, 3... 10), Simple (Previous / Next).
- **States:** Default, Hover, Disabled (e.g., "Previous" is disabled on page 1).
- **Accessibility:** Wrap in a `<nav>` tag with `aria-label="Pagination"`. `aria-current="page"` on the active number.
- **Usage Guidelines:** Prefer Simple (Previous/Next) for mobile, and Numbered for Desktop. Keep a maximum of 5 visible numbers at a time.

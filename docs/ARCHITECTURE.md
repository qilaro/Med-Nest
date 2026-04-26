# Project Architecture & Design Philosophy

This document explains the organization of the MedQ codebase. It is designed to help you understand how to maintain and expand the project.

## 1. Component Philosophy: "Atomic Design"

We split components into two main categories to keep the project clean and manageable.

### A. Generic UI Components (`components/ui/`)
*   **Purpose**: These are the "building blocks" or "frames." They are generic and don't know about medications or patients.
*   **Examples**: `button.tsx`, `card.tsx`, `input.tsx`, `StarRating.tsx`.
*   **Analogy**: A picture frame. You can put any picture inside it.
*   **Rule**: If you want to change the border thickness for *all* cards on the site, change it here.

### B. Domain Components (`components/drugs/`, etc.)
*   **Purpose**: These are "assemblies" or "pictures." they are built for specific features.
*   **Examples**: `DrugCard.tsx`.
*   **Analogy**: The specific picture of a medicine that goes inside the frame.
*   **Rule**: If you want to move where the "Generic Name" appears on the medicine card, change it here.

---

## 2. Folder Structure

| Folder | Purpose | Analogy |
| :--- | :--- | :--- |
| `frontend/app/` | **The Map**. Defines the URLs (e.g., `/drugs`). | The Storefront layout. |
| `frontend/components/ui/` | **The Legos**. Reusable, generic UI pieces. | The furniture in the store. |
| `frontend/components/[feature]/` | **The Displays**. Feature-specific visual pieces. | The specific product displays. |
| `frontend/lib/services/` | **The Engine**. Handles talking to the API/Database. | The delivery trucks bringing data. |
| `frontend/types/` | **The Contracts**. Defines what "Data" looks like. | The inventory checklist. |

---

## 3. Styling & Theming

We use **Tailwind CSS** combined with **CSS Variables** located in `app/globals.css`.

*   **Variables**: Instead of using hardcoded colors (like `#57B8A6`), we use variables like `--primary`.
*   **Theme**: We use Tailwind classes like `text-primary`.
*   **Benefit**: If we want to rebrand the site to blue, we only change the `--primary` variable in one file (`globals.css`), and the entire site updates instantly.

---

## 4. Engineering Standards

1.  **Zero Design Deviation**: Matches `reference/index.html` pixel-for-pixel.
2.  **Accessibility First**: Uses `aria-labels` and semantic HTML so everyone can use the site.
3.  **Separation of Concerns**: Visual components should not handle database logic. They just "ask" the services for data.

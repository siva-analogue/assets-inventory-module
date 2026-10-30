# SocietyOps — Master Setup (Static React Demo)

A responsive React + Vite demo for the Society Management System's Master Setup module:

- **Asset Master:** create/edit assets, assign responsibility and location, procurement fields, AMC/vendor selection, lifecycle status.
- **Inventory Master:** item setup, threshold alerts, activate/deactivate, and Stock In / Stock Out actions. Existing stock is locked when editing item details.
- **Vendor Master:** vendor contacts, type/service, optional GST, internal rating, and quick links to filter associated assets or inventory items.
- **Overview:** summary cards, recent assets, low-stock alerts, and quick actions.

Phase 2 is available through Indent Management and Purchases in the workspace. Approval decisions are handled directly on indent records; approval routing rules and role permissions remain part of the workflow, but their separate screens are not shown. Inventory indents select existing items from Inventory Master. Creating an item from the indent form adds it to Inventory Master with a generated ID and links the new indent to that item. Indents validate against the Asset and Inventory masters. Purchases advances approved indents through two-vendor quotations, purchase order generation, purchase recording, invoice/payment tracking, and stock-in; received inventory is added to shared stock.

## Run locally

1. Install Node.js (LTS) if needed.
2. Extract this folder and open it in VS Code.
3. Open a terminal in the project directory.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

To make a production build, run `npm run build`.

## Notes

- This is a **static front-end prototype**. It does not use a backend or database; updates remain in React state for the current page session and reset on refresh.
- Invoice upload is represented by a file input only; the file is not uploaded or persisted.
- Phase 2 photo attachments are represented by selected file names only; files are not uploaded or persisted.
- Sample vendors and society records are fictional demo data.
- Phase 2 approval rules, indent records, and stock movements are also session-only demo data.

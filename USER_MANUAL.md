# 📖 WorkDesk User Manual

Welcome to WorkDesk. This manual explains the system flow, operational logic, and financial calculations used throughout the application.

---

## 1. Core Operational Flow

WorkDesk follows a strict **Daily Lifecycle** to prevent data discrepancies:

1.  **Opening the Day:** (Daily Stocks Module)
    - Before any sales or purchases can be made, the day must be "Opened".
    - This captures the current snapshot of inventory.
2.  **Transactions:** (Billing, Purchases, Expenses)
    - Throughout the day, staff perform sales, record new supplies, and log operational expenses.
3.  **Closing the Day:** (Daily Stocks Module)
    - At end of shift, the day is "Closed".
    - This locks all transactions for that date.
    - Generates a finalized record in the **Operational Journal**.
    - Prevents back-dating or tampering with finalized data.

---

## 2. Inventory & Money Logic

### 📦 FIFO Storage (First-In, First-Out)
Unlike simple spreadsheets, WorkDesk tracks **Batches**. 
- When you purchase stock, it creates a new batch with a specific `industryPrice`.
- When you sell stock (Billing), the system automatically deducts units from the **oldest batch first**.
- This ensures accurate valuation of inventory based on actual purchase costs over time.

### 💰 Financial Calculations

| Metric | Calculation Formula | Description |
| :--- | :--- | :--- |
| **Gross Sales** | `Σ (Selling Price * Quantity Sold)` | Total revenue from invoices. |
| **Purchase Value** | `Σ (Unit Cost * Quantity Purchased)` | Total outflow for new inventory. |
| **Direct Expense** | `Σ (Amount logged in Expenses)` | Shop rent, tea, transport, etc. |
| **Net Cashflow** | `(Gross Sales) - (Expenses)` | The actual cash movement for the day. |
| **Stock Value** | `Σ (Remaining Units * Current Selling Price)` | The total market value of held assets. |
| **Estimated Net** | `Gross Sales * 0.15` | A calculated 15% margin estimate for quick visibility. |

---

## 3. Module Guide

### 💳 Billing (POS)
- **Manual Entry:** Use for loose sales where specific product IDs are not required. Money is tracked, but stock is not deducted.
- **Product Sales:** Click items to add to cart. Stock is automatically deducted from FIFO batches upon completion.
- **Payment Methods:** Tag transactions as Cash, QR, or Card for reconciliation.

### 📥 Purchases
- When new stock arrives, log it here.
- Requires an **Invoice Number** and **Unit Cost**.
- Automatically creates an "Active Batch" in Storage.

### 📤 Expenses
- Log every rupee spent out of the cash box.
- Categorized (Salary, Utility, Misc) for better reporting.

### 👥 Members
- **Admin:** Full access to all modules and settings.
- **Sales:** Restricted to Billing and Storage view only.

---

## 4. Customization (Settings)

- **Primary Accent:** Change the global brand color. This updates buttons, charts, and icons instantly.
- **Theme Engine:** Toggle between Dark and Light modes.
    - *Dark Mode:* Optimized for high-focus environments and reduced eye strain.
    - *Light Mode:* Optimized for high-visibility environments and printing.

---

## 🔒 Security & Audits
Every "Save", "Delete", and "Manual Correction" is logged in the **Audit Logs**. The log includes:
- The User who performed the action.
- A timestamp.
- The specific change made (e.g., "Stock Correction: 50 -> 45").

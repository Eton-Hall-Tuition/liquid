# 🚀 WorkDesk ERP | Enterprise Distribution Manager

WorkDesk is a high-performance, precision-engineered ERP system designed for modern distribution and retail environments. Built with a focus on speed, clarity, and architectural integrity.

## 🛠 Tech Stack

- **Framework:** [React 18+](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/) (via `motion/react`)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Date Handling:** [date-fns](https://date-fns.org/)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-autotable)
- **State Management:** Custom Selective Store (Zustand-inspired pattern)

## 📋 Key Features

- **3D Interactive Interface:** Immersive Spline-powered 3D login background for a modern premium feel.
- **Identity Vault:** Secure credential management with document verification (Aadhaar/Photo support) and read-only identity views.
- **Dynamic Theming:** Seamless switching between High-Contrast Dark and Pure White modes with system-wide primary accent persistence.
- **FIFO Inventory:** Real-time stock tracking using First-In-First-Out batch processing.
- **Operational Journaling:** Strict daily opening/closing procedures to ensure data integrity.
- **Financial Analytics:** Real-time revenue, expense, and estimated net profit tracking.
- **Audit Vault & Auto-Maintenance:** Comprehensive logging of system actions with an automated 6-month purging cycle to maintain performance.
- **System Reset:** Super Admin control to wipe all operational data while preserving administrative access.
- **Automated Reporting:** One-click PDF generation for daily journals and stock snapshots.
- **Workforce Management:** Role-based access control (RBAC) with secure invitation-based onboarding.

## 🏗 Project Structure

```text
src/
├── components/     # UI Modules (Billing, Storage, Dashboard, etc.)
├── lib/            # Shared Utilities (cn helper)
├── store/          # Global State & Business Logic
├── App.tsx         # Layout & Theme Engine
└── main.tsx        # Entry Point
```

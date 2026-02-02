# PAEPAR.COM (web.app)

> **The operating system for vehicle paperwork.** > A digital concierge platform streamlining vehicle documentation and license processing in Nigeria. Built to replace queues with code, featuring real-time status tracking and automated workflow management.

---

## 🛠 Tech Stack

**Frontend**
- **Framework:** Next.js (TypeScript)
- **Styling:** Tailwind CSS
- **State Management:** React Context / Zustand (TBD)

**Backend**
- **Framework:** Python (Django REST Framework)
- **Database:** PostgreSQL
- **Admin:** Django Admin (Agent Dashboard)

---

## 🎨 Brand Identity

When styling components, adhere strictly to the **Paperwork Padi** design system:

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Padi Blue** | `#0b1eee` | Primary Buttons, Headers, Links |
| **Padi Light** | `#5561f4` | Accents, Hover States |
| **Padi White** | `#ffffff` | Backgrounds, Cards |
| **Surface** | `#f8f9fa` | Form Backgrounds, Inputs |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL

### Installation

**1. Clone the repository**
```bash
git clone [https://github.com/paepar-com/web.app.git](https://github.com/paepar-com/web.app.git)
cd web.app

```

**2. Frontend Setup**

```bash
cd frontend
npm install
npm run dev

```

**3. Backend Setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

```

---

## 🤝 Contribution Workflow

We follow a strict **Feature Branch Workflow**. Direct pushes to `main` are **blocked**.

**1. Create a Branch**
Do not work on main. Create a branch for your specific task:

* Features: `feat/payment-gateway`
* Bug Fixes: `fix/mobile-nav`
* Documentation: `docs/api-schema`

```bash
git checkout -b feat/your-feature-name

```

**2. Commit Standards**
Write clear, descriptive commit messages.

* ✅ `feat: added paystack integration logic`
* ❌ `updates`

**3. Submit a Pull Request (PR)**

* Push your branch to origin.
* Open a PR on GitHub comparing your branch to `main`.
* Assign the PR to the Project Lead for review.
* **Do not merge your own PR.** Wait for approval.

---

## 📄 License & Privacy

**© 2025 PEAPAR.COM**
This repository contains proprietary source code. Unauthorized copying, distribution, or use of this file, via any medium, is strictly prohibited.


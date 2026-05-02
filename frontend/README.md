# SmartBuy Frontend

This is the frontend application for the **SmartBuy** e-commerce platform, built with **Next.js 16** and **TypeScript**. It serves as a high-performance procurement dashboard for both customers and administrators.

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16** | Core framework (App Router) |
| **React 19** | UI library |
| **TypeScript** | Static typing and code safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Axios** | API communication and interceptors |
| **Lucide React** | Iconography |

## Project Structure
The project follows a modular structure within the `app` directory to maintain a separation of concerns:

### 1. `/app` (Routes and UI)
* **`/admin`**: Administrative dashboard for managing inventory and processing orders.
* **`/cart`**: Management of items added to the procurement list.
* **`/checkout`**: Multi-step ordering process, including address handling and payment initiation.
* **`/profile`**: Customer dashboard for tracking order history and status.
* **`/product/[id]`**: Dynamic routing for detailed technical specifications of hardware.
* **`/login` & `/register`**: Authentication modules.

### 2. `/app/services` & `/app/lib`
* **`axios.ts`**: Configured Axios instance with interceptors to automatically handle `X-Session-Id` and `X-Auth-Token` headers.
* **`api.ts`**: Centralized service layer containing all API call definitions (Catalog, Cart, Auth, Order, Payment).

### 3. `/app/types`
* **`/dto`**: Data Transfer Objects reflecting the exact request/response structures of the backend API.
* **`/models`**: Internal domain models used within the React application.

### 4. `/app/context`
* **`CartContext.tsx`**: Global state management for cart synchronization, price change notifications, and item persistence.

### 5. `/app/components`
* **`/ui`**: Reusable atomic components like `ProductCard`.
* **`/layout`**: Global structural elements like `Navbar` and `Footer`.

## Getting Started

### Prerequisites
* **Node.js** (v20 or higher)
* **npm** or **yarn**

### Installation
1. Clone the repository.
2. Install dependencies:
```bash
npm install
```

### Development
Run the development server:
```bash
npm run dev
```
The application will be available at **http://localhost:3000**.

### Building for Production
Create an optimized production build:
```bash
npm run build
npm start
```

---

## Core Configurations
* **`next.config.ts`**: Next.js specific settings.
* **`tailwind.config.ts`**: Custom design tokens and theme extensions.
* **`tsconfig.json`**: TypeScript path aliases and compiler options.

---

## Security and Interceptors
The application uses a **Zero-Footprint Authentication** strategy. Tokens and Session IDs are stored in `localStorage` and injected into the header of every outgoing request via the Axios interceptor in `app/lib/axios.ts`. If an "Invalid auth token" error is detected (HTTP 401/403), the interceptor automatically clears local storage to ensure system integrity.
# Delivery App — Frontend

Food delivery web application built as part of the ElifTech School test task.

> Backend repo: [delivery-app-backend](https://github.com/anton-kulchytskyi/delivery-app-backend)

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** for cart state (persisted in localStorage)
- **Zod** for form validation
- Deployed on **Vercel**

## Live

- App: `https://delivery-app-frontend-one.vercel.app/`
- API: `https://delivery-app-backend-production-de2c.up.railway.app/api-docs`

## Run locally

```bash
npm install
echo "VITE_API_URL=https://delivery-app-backend-production-de2c.up.railway.app" > .env.local
npm run dev
```

## Features

- Browse restaurants and their menus
- Browse all dishes across restaurants with filters and infinite scroll
- Filter by category, sort by price or name
- Cart with coupon support (server-validated discounts)
- Order placement with form validation
- Order history search by phone number
- Reorder from past orders

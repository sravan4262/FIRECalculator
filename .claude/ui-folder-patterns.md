## Project folder Structure

```
UI/
├── app/
│   ├── (auth)/          ← unauthenticated routes (no sidebar, no AuthGuard)
│   ├── (app)/           ← authenticated routes (AppShell + AuthGuard in layout.tsx)
│   ├── globals.css
│   └── layout.tsx       ← root layout: ThemeProvider, Toaster
├── components/
│   ├── features/        ← one subfolder per domain, owns its screen + subcomponents
│   ├── layout/          ← structural primitives shared across routes
│   └── ui/              ← shadcn/ui primitives + reusable custom components
├── hooks/               ← custom hooks (state/browser APIs only — no business logic)
├── lib/                 ← api.ts, schemas.ts, mock-data.ts, utils.ts
└── proxy.ts             ← Next.js 16 middleware (cookie-based auth guard)
```
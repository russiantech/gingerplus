# Client architecture (React 18 + TypeScript + Bootstrap 5 + Vite)

```
src/
  types/        openapi.d.ts (generated: `npm run gen:types`) + index.ts friendly aliases
  services/     http.ts (fetch, bearer, refresh), auth/account/shop/public.ts, admin/index.ts (adminApi)
  contexts/     Auth, Cart (localStorage), Site (bootstrap settings/hero), Toast
  hooks/        useAsync, useDebounce, useDocumentTitle, usePageTracking ...
  utils/        format.ts (money/date), constants.ts (status colours), storage.ts
  components/   common/ (Modal, Input, Select, Pagination, Img, StatusBadge...), admin/ (PageHeader, Panel, StatCard, DataTable, FilterBar),
                layout/, shop/, content/ (CMS block renderer)
  layouts/      PublicLayout, AuthLayout, AccountLayout, AdminLayout
  pages/        public/, auth/, account/, admin/   (route-level, lazy loaded from routes/index.tsx)
  routes/       index.tsx (route table), guards.tsx (RequireAuth / RequireStaff(perm) / RequirePartner)
  styles/       tokens.css (palette + Bootstrap overrides), base.css, public.css (storefront), admin.css (dashboard)
```

Conventions: no Bootstrap JS (React state drives modals/dropdowns); money via `money()`; images via `<Img>` (placeholder fallback);
all server calls through `services/*`; errors surfaced with `useToast().error(e.message)`; every page sets `useDocumentTitle`.
Brand palette (carton): ginger brown `#7f4e1a`, amber gold `#e8a317`, cream `#fbf6ec`; flavours Turmeric `#E8A317`, Honey `#B7791F`, Guarana `#5B8C3A`.

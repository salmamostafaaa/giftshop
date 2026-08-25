# Aura Gift & Beauty Shop

A complete, responsive Angular + Bootstrap 5 e-commerce website built for the
**Angular + Bootstrap Website Project** assignment. Custom color palette:
`#19183B` · `#708993` · `#A1C2BD` · `#E7F2EF`.

## What's inside

- **Angular 21 Standalone Components**, lazy-loaded via routing
- **Pages (8, routed):** Home, Shop (Products), Product Detail, Categories, Cart, Login, Register, My Account (protected), 404
- **Auth flow:** Register / Login with Reactive Forms + validation, token persisted in `localStorage`, logout, and an `authGuard` protecting `/profile`
- **HTTP Interceptor** attaching the bearer token to outgoing requests
- **Services:** `ProductService` (HttpClient → Makeup API, with a bundled JSON fallback if the live API is down), `AuthService`, `CartService`, `ToastService`
- **Component communication:** `ProductCard` demonstrates `@Input()` (product data in) and `@Output()` (add-to-cart event out)
- **Every required Bootstrap component**: navbar, cards, buttons, forms w/ validation styling, tables, alerts, badges, breadcrumbs, button groups, list groups, progress bars, spinners, pagination, accordion, tabs/pills
- **Bonus Bootstrap components**: carousel, modal, tooltips, collapse/accordion, dropdowns, toasts, offcanvas mobile menu
- **Bonus Angular items**: interceptor, route guard, loading states, error handling, reusable generic components (`ProductCard`, `StarRating`, `Spinner`, `ToastContainer`)

## Data source

Products come from the public **Makeup API**
(`https://makeup-api.herokuapp.com/api/v1/products.json`) via `HttpClient`.
That API runs on a free host that occasionally goes offline — if the request
fails, `ProductService` automatically falls back to a bundled dataset served
from `/assets/data/fallback-products.json` (still a real HTTP request, not
hard-coded data), so the site keeps working for grading/demo purposes either way.

Auth (register/login) is implemented as a small local mock "backend" in
`AuthService`, persisted to `localStorage`, because none of the assignment's
allowed public APIs (Makeup API, TheMealDB, JSONPlaceholder) provide real user
authentication. It simulates network latency with RxJS so loading states,
disabled buttons, etc. behave exactly like a real API call.

## Project structure

```
src/app/
  core/
    models/        Product, User, Cart interfaces
    services/       ProductService, AuthService, CartService, ToastService
    guards/         authGuard
    interceptors/   authInterceptor
  shared/components/
    navbar/ footer/ product-card/ star-rating/ spinner/ toast/
  pages/
    home/ products/ product-detail/ categories/ cart/
    login/ register/ profile/ not-found/
```

## Run it locally

```bash
npm install
npm start          # ng serve, then open http://localhost:4200
```

## Build for production

```bash
npm run build       # outputs to dist/giftshop/browser
```

## Deploy

### Option A -- Vercel (recommended, vercel.json already included)

```bash
npm install -g vercel      # one-time
vercel login                # one-time, opens browser
vercel                      # deploy a preview
vercel --prod                # deploy to production
```
Vercel auto-detects the Angular build; vercel.json in this repo handles the
SPA rewrite (so refreshing /products/12 etc. doesn't 404).

### Option B -- Netlify (netlify.toml + public/_redirects already included)

```bash
npm install -g netlify-cli   # one-time
netlify login                 # one-time, opens browser
netlify deploy                # deploy a preview
netlify deploy --prod         # deploy to production
```

### Option C -- Netlify via drag-and-drop (no CLI)

```bash
npm run build
```
Then drag the dist/giftshop/browser folder onto https://app.netlify.com/drop.

## Submission checklist mapping

Every item in the assignment's pre-submission checklist is covered -- see the
component list above. The custom color palette lives in src/styles.scss as
both Bootstrap Sass-variable overrides and CSS custom properties, applied
consistently via .btn-sage, .bg-ink, .text-slate, etc.

# HAAD Store: audit and test report

Tested on a production build (`npm run build` + `npm start`) with Chromium (Playwright), desktop 1440x900
and phone 390x844, English and Urdu. Everything below was actually run; the last section lists what was NOT tested.

## Result
- TypeScript (`tsc --noEmit`): clean. Lint (`eslint`): clean. Production build: succeeds.
- 379 browser checks on the working copy: 225 (pages) + 44 (cart/checkout) + 74 (accounts/admin/reviews/wishlist) + 36 (3D/SEO/Urdu/friendliness). 0 failed on the final build.
- The final ZIP was unpacked in an empty folder: `npm ci`, lint, tsc, `db:setup`, build all ran clean, then the 225 page checks and the 44 cart/checkout checks passed again on that fresh install (269 checks).

## The reported errors
1. `Failed query ... from products`: reproduced. Cause: the site was started before the database tables existed
   (`npm run db:setup` not run). Fixed: `npm run dev` now creates the database first (`predev`), setup is safe to repeat,
   and a missing database shows a friendly error page instead of a crash.
2. `#name not found` in the browser test: it was a TEST problem, not an app bug. The test had put a damaged cart
   into the browser; the app correctly showed an empty cart (no form). Two other test mistakes (a URL pattern that matched
   too early) were found and the tests were made stricter so they cannot pass by accident.

## Bugs found and fixed in this audit
- Fresh copy without `.env` (for example from GitHub): `db:seed` failed. Fixed.
- `.gitignore` also hid `.env.example`; the ZIP contained a `.git` folder. Fixed.
- Order numbers could be guessed (time based) and the order page shows name, phone and address. Now 10 random characters.
- A damaged cart in browser storage crashed the page. The cart is now validated.
- Open redirect after login with `next=/\evil.com`. Fixed.
- A text file renamed to `.png` was accepted as a photo. The real file contents are checked now.
- Default English 404/error pages did not match the site or Urdu. Added matching, translated pages.
- A developer message ("run npm run db:setup") could show to customers on an empty shop. Replaced.
- Urdu: product page scrolled sideways (hidden spam-trap field). Fixed earlier, re-verified on all pages.
- AUTH_SECRET: a fixed fallback is used only on your own computer; the live site still refuses to run without a real one.

## Made friendlier (no new features)
- Phone menu now has Wishlist and Account (they were missing on phones).
- "Skip to content" link for keyboard users.
- Checkout pre-fills name and email for logged-in customers; error messages scroll into view.
- "Continue shopping" link in the cart.

## Tested and PASSED (all actually run)
- Pages: 18 URLs x English/Urdu x desktop/phone: right status code, correct `lang`/`dir`, no sideways scroll, no JavaScript errors, no broken requests. Link crawl of all internal links: none broken.
- Language: switch EN to UR to EN on desktop (header button) and phone (menu), kept after navigation and reload, RTL on every page above, Urdu error messages (checkout, reviews).
- Theme: light/dark toggle persists after reload; light mode on 6 phone pages has no overflow.
- Shop: search, tag filter, sort (price), bad input, SQL-style text, form submit.
- Cart: add, badge, quantity limited to stock, minimum 1, remove, survives reload, empty states.
- Checkout: bad phone, bad email, short address, invalid / valid (lower-case) / switched-off / expired coupon, cash-on-delivery order, totals, stock reduced, coupon use counted, cart cleared, random order number, unknown order is 404.
- Tampering: fake price ignored (DB price charged), quantity above stock, unknown product, negative quantity, damaged cart storage.
- Two buyers for the last piece at the same moment: exactly one order, stock never below zero. Sold-out shown on card and product page.
- Accounts: signup validation, duplicate email (case-insensitive), password stored hashed, httpOnly + SameSite cookie, login/logout, same message for wrong password and unknown email, tampered/garbage cookie rejected, protected pages redirect, customers cannot open any admin page, open-redirect attempts, valid `next` honoured, logged-in orders appear in My orders.
- Wishlist: logged-out heart goes to login, add/remove on cards and product page, saved in DB, survives reload, wishlist page.
- Reviews: validation, hidden until approved, spam-trap field, guest and logged-in, admin approve and delete, appears on product and home page, Urdu validation message.
- Admin: login, order list and status change, product add (with photo), edit (photo kept), duplicate slug, price 0, fake image, image over 5 MB, hide/show (404 when hidden), featured product on home, sort by price with the new product, coupon create/clean/over-100%/turn off; all admin actions check the admin role (code check).
- Safety: text like `<img onerror>` / `<script>` in reviews, names and addresses is shown as plain text (not run) on product, home, order page and admin; `/uploads` path-traversal and unknown names blocked; security headers present.
- 3D: loads only when scrolled into view on phone, canvas appears, drag works, hint translated; with WebGL switched off the photo is shown instead.
- SEO: robots.txt, sitemap (pages + active products only), product structured data (price in PKR, rating after a review), Open Graph, canonical, one H1 on main pages, image alt text, no unnamed buttons.
- Email (with a pretend email server): skipped without a key; with a key the owner and the customer both get a message, HTML escaped.
- Database: `db:setup` repeated adds nothing twice; fresh install from the ZIP works.

## NOT tested (could not, or not done) - please read
- Real Turso database, real Vercel Blob photo upload, real Vercel deployment, real domain. No network from here. The code compiles and the local fallback works, but the live parts are unproven. Do the test steps in DEPLOY.md step 6.
- Real email delivery through Resend (only a pretend server was used).
- Only Chromium was used. Safari (iPhone), Firefox, Samsung browser and real phones were not tried; "phone" means a 390x844 simulated screen.
- Bank-transfer order was not placed in this audit (only cash on delivery); it uses the same code path and was only checked in an earlier step.
- Urdu wording quality was not checked by a native reader. Admin dashboard and order emails are English only.
- No Lighthouse/speed score, no load test, no screen-reader test (only automatic checks for alt text, names and headings). I looked at a handful of screenshots myself, not at every page.
- No login rate limit or CAPTCHA (not added, as no new features were asked): someone could try many passwords. Add before heavy traffic.
- `npm audit` lists 6 advisories in packages (`@vercel/blob` chain: high; `next`: moderate, the fix is Next 16, a major upgrade; `postcss`). Not changed to avoid breaking a working build; review before launch.
- Concurrency was tried with 2 buyers only.
- The sample perfumes use other brands' pictures and sample text: replace before launch. Delivery/Returns/Privacy text is a draft.

---
# Phase 1 "level 100" upgrade — test addendum (2026-11-09)
Run on a freshly created DB, production build (`next start`), Chromium via Playwright.
- audit1 pages/links/RTL/overflow (EN+UR, desktop+phone): 225 pass, 0 fail
- audit2 cart/checkout/coupon/stock: 44 pass, 0 fail
- audit3 accounts/admin/reviews/wishlist/orders: 74 pass, 0 fail
- audit4 SEO/a11y/tilt photo/Urdu/friendliness: 39 pass, 0 fail
- audit5 NEW drawer, toast, stepper, header count, persistence, back-to-top, anchor scroll, overflow (EN/UR × desktop/phone): 53 pass, 0 fail
- `tsc --noEmit` clean, `eslint` clean, `next build` OK.
Bugs found and fixed in this phase: provider order (site 500), /product/<bad-slug> returned 200 because of loading.tsx (removed), closed cart drawer was focusable (now `inert`), anchor links hid under sticky header.
Test changes: tests rewritten for new behaviour (drawer instead of /cart redirect; 3D canvas tests replaced by tilt-photo tests).
NOT tested / limits: real Turso, Vercel Blob, Resend, live deploy; real touch devices/Safari/Firefox (Chromium only); screen readers; load/performance numbers; "product page shows already-in-cart status line" was not asserted by a test (only seen in code). The bottle is now a tilting PHOTO, not true 360° 3D. Sample photos/text must be replaced before launch.
Phases 2–5 (filters, variants, gallery, newsletter, blog, etc.) are NOT built yet.

## Addendum 2 (2026-11-09): smooth nav scroll + WhatsApp orders
- audit6 (new): smooth-scroll (same page, from /shop, phone menu), WhatsApp link/message content, admin orders view + customer WhatsApp link: 11 pass. Full re-run audit1-5: 436 pass, 0 fail. tsc, eslint, build clean.
- NOT tested: real delivery to WhatsApp (needs CALLMEBOT_APIKEY activated by the owner of 03087475047; code path `notifyShopWhatsApp` only runs with a key and was not exercised against the real service). Phone-menu scroll check is loose (click errors were swallowed).

## Addendum 3 (2026-11-09): site-wide smooth scrolling
Lenis (wheel/trackpad easing), anchor links glide (same page and cross-page), page fade-in on route change, back-to-top glides; off for reduced-motion. audit7 (8 checks) + audit1-6 re-run: all pass after fixing an overshoot on anchor links and back-to-top. tsc/eslint/build clean.
NOT tested: real touch devices/Safari/Firefox, high-refresh or trackpad inertia feel (only scripted wheel events), phone (Lenis also runs on touch; native scroll feel unverified).

## Addendum 4 (2026-11-10): payment methods
Methods: JazzCash, Easypaisa, Meezan bank transfer (reference + receipt), Cash on delivery. See PAYMENTS.md.
Tested on a FRESH unzip (npm install, db:setup, tsc, eslint, build all clean), Chromium:
- audit1 pages/RTL/overflow 225 · audit2 cart/checkout 44 · audit3 accounts/admin/reviews 74 (incl. "every admin server action calls requireAdmin") · audit4 39 · audit5 54 · audit6 11 · audit7 8
- audit8a (no credentials): 16 pass: JazzCash/Easypaisa/Meezan disabled "Not available yet", server refuses forced use, COD works, admin marks cash collected, history logged
- audit8b (test credentials + local mock gateway): 46 pass: bank reference/receipt validation, Pending Verification, admin reject/verify, private receipts, JazzCash forged/unsigned/wrong-amount/replay/declined/retry, Easypaisa never auto-paid, price tampering, no secret in HTML
Bugs fixed: admin Verify/Reject/Cash-collected buttons did nothing in a real browser (button value not sent) -> one server action per button; receipts moved from local disk/public blob into the private database.
OPEN: React hydration error #418 appeared on 2 of ~8 first runs right after a fresh server start (once on en/phone, once en/desktop); not reproducible in 6 other full runs; page not identified. Cosmetic in tests so far, but unresolved.
NOT tested: real JazzCash/Easypaisa (no merchant credentials; the mock gateway only proves OUR logic, not that field names/URLs match their real API), real bank, real Vercel Blob/Turso/Resend/WhatsApp, other browsers/real phones. Order cancellation does not restore stock.

## Addendum 5 (2026-11-10): final hardening
Added: login lock after 8 wrong passwords per email for 15 min (DB-based, works on serverless); cancelling an order returns its bottles to stock (once only; cancelled orders stay cancelled). audit9: 9 checks pass.
Still open: intermittent React hydration error #418 right after a fresh server start (not reproduced in dev mode, source not found); real gateway/bank/Turso/Blob/Resend/WhatsApp untested; Phases 2-5 of the "level 100" plan (filters, sale price, gallery, sizes, newsletter, blog, FAQ) NOT built.

# Levo Lawn Care website

Redesign of [levolawncare.com](https://www.levolawncare.com), built as plain HTML, CSS and JavaScript with no build step.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `services.html` | Services |
| `contact.html` | Contact (embedded Jobber request form) |
| `about.html` | About (mow-to-reveal sections and the mowed-path timeline) |

Shared styles are in `assets/css/style.css` and all animations are in `assets/js/main.js`.
The header and footer are repeated in each page, so a change there has to be made in all four files.

## Run it locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.

The mower intro plays once per browser session. To see it again, open a new private window or run `sessionStorage.clear()` in the browser console and reload.

## Before launch

- [ ] Replace the placeholder phone number `(970) 555-0123` / `+19705550123` in `contact.html` and `about.html`
- [ ] Replace the placeholder email `hello@levolawncare.com` in `contact.html`
- [ ] Remove the yellow `PLACEHOLDER` tags in `contact.html`
- [ ] Confirm the rights to the lawn photos in `assets/img/`, or swap in the owner's own job photos

## Going live with GitHub Pages

1. Make the repo public (or use GitHub Pro), then go to **Settings → Pages** and deploy from the `main` branch, `/ (root)`.
2. Under **Custom domain**, enter `www.levolawncare.com`.
3. At the domain registrar, add:
   - `CNAME` record: `www` → `<github-username>.github.io`
   - `A` records for the bare domain: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
4. Once the new site loads, cancel the Weebly plan.

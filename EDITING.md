# Editing kodedev.co.uk

This is the source for kodedev.co.uk — a single-page static HTML site with a modern design, animations, and contact forms.

## Quick Edit Workflow

### 1. Make changes
Edit `index.html` directly in your editor:
```bash
# From /root/kodedev-site/
vim index.html
```

### 2. Test locally
Open `index.html` in a browser:
```bash
open index.html  # macOS
# or just drag index.html into your browser
```

### 3. Commit and push
```bash
git add index.html
git commit -m "feat: add new section" -m "Describe what changed"
git push origin main
```

**Deployment is automatic** — GitHub Pages (or wherever it's hosted) deploys on push to main.

## Forms Configuration

Both forms use **Formspree** for submissions:
- **Formspree ID:** `xreozjpb`
- **Email:** karl@kodedev.co.uk
- **Forms:**
  - `#sample-form` → "Get My Free Sample"
  - `#contact-form` → "Start Your Project"

Both endpoints are configured in `index.html` (lines ~772-773):
```javascript
var SAMPLE_ENDPOINT  = 'https://formspree.io/f/xreozjpb';
var CONTACT_ENDPOINT = 'https://formspree.io/f/xreozjpb';
```

Forms work automatically — no additional configuration needed.

## File Structure

```
/root/kodedev-site/
├── index.html          # Main site (815 lines)
├── robots.txt          # SEO
├── sitemap.xml         # SEO
├── .gitignore
└── README.md
```

## Editing Tips

### Mobile Responsiveness
- Use Tailwind CSS classes (site uses Tailwind)
- Test on mobile: Use browser DevTools (Ctrl+Shift+M / Cmd+Shift+M)
- Header size: Currently optimized for mobile (see recent commit history)

### Adding Sections
1. Add HTML inside the main `<div id="app">` section
2. Use Tailwind classes for styling
3. Keep animations smooth (site uses CSS transitions)

### Form Updates
1. Edit the form HTML (e.g., add/remove fields)
2. Update `submitForm()` if field validation needs changes
3. No backend changes needed — Formspree handles everything

## Git Workflow

```bash
# Always work on main branch
git checkout main

# Sync with remote
git pull origin main

# Make changes
git add index.html
git commit -m "type: description"

# Push (triggers auto-deployment)
git push origin main
```

## History

Recent commits:
- Mobile header optimization
- Formspree integration (both forms wired)
- SEO (robots.txt, sitemap, meta tags)
- Animations and modern design

## Automation

The **Telegram bot** can also edit this site:
- Trigger: "kodedev" / "kode dev" / "my portfolio"
- It fetches the HTML, edits with Claude, and commits/pushes automatically
- See `/root/telegram_bot/site_manager.py` for the integration

---

**Production URL:** https://kodedev.co.uk
**GitHub Repo:** https://github.com/kpppics/kodedev

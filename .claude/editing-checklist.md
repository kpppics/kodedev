# kodedev.co.uk Editing Checklist

Before committing changes, verify:

- [ ] **No hardcoded secrets** — Check Formspree ID is never exposed as a secret (it's intentional)
- [ ] **Mobile responsive** — Tested on mobile (DevTools: Ctrl+Shift+M)
- [ ] **Forms working** — Both forms can submit
- [ ] **Links valid** — All internal and external links work
- [ ] **Images load** — No broken image references
- [ ] **Animations smooth** — No visual glitches
- [ ] **SEO tags intact** — robots.txt, sitemap.xml, meta tags preserved
- [ ] **Commit message clear** — Describes the change

## Quick Validation

```bash
# Check for common errors
grep "TODO\|FIXME\|YOUR_" index.html

# Validate HTML syntax
# (no tool needed, just visual inspection in browser)
```

## After Pushing

1. Wait ~30 seconds for deployment
2. Check https://kodedev.co.uk in a browser
3. Test forms on live site
4. Verify mobile layout

## Emergency Rollback

If something breaks:
```bash
git revert HEAD --no-edit
git push origin main
```

---

**Last verified:** 2026-03-25
**Current deployment:** Automatic via GitHub

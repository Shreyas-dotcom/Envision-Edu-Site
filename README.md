# Envision Education website

The source for [envision-education.org](https://www.envision-education.org), moved off Wix onto GitHub Pages.
It's built with [Eleventy](https://www.11ty.dev/), a small static-site tool: you write plain text and
data files, and it turns them into ordinary HTML pages. No database, no monthly bill.

Every page keeps its old Wix address (`/our-mission`, `/envison-team`, `/post/...`), so existing
links and search results keep working.

## Editing content (no coding needed)

You can edit any of these files straight on github.com (pencil icon → "Commit changes").
The site rebuilds and goes live by itself about a minute later.

| What you want to change | File |
| --- | --- |
| Trips: text, numbers, slideshow photos, film | `src/_data/trips.json` (feeds the home page timeline, Projects, each project page and the Gallery) |
| Team members | `src/_data/team.json` |
| Advisory board | `src/_data/advisory.json` |
| Legacy / former members | `src/_data/legacy.json` |
| Home page quotes | `src/_data/testimonials.json` |
| Partner logos | `src/_data/partners.json` |
| TelEnvision videos | `src/_data/videos.json` (the YouTube video id is the part after `v=`) |
| Menu | `src/_data/nav.json` |
| Address, email, social links, contact form | `src/_data/site.json` |
| Old addresses that forward somewhere else | `src/_data/redirects.json` |
| Home page text | `src/index.njk` |
| Donation tiers and payment links | `src/donate.njk` |
| Other pages | `src/our-mission.njk`, `src/about-4.njk` (Our People), `src/projects.njk`, … |

### Adding a trip

Add an entry to `src/_data/trips.json` (copy an existing one). It automatically gets a spot on the
home page timeline, a card on Projects, its own page at `/projects/<slug>/`, and a Gallery section.
Set `"category"` to the blog category its posts use, and add that category to
`src/_data/blogCategories.json`, so the project page lists the trip's posts.

### Adding a photo

1. Put the image in `src/assets/img/` (please resize it to about 2000px wide first: phone photos are huge).
2. Reference it as `/assets/img/your-photo.jpg`.

Anywhere a data file asks for an image (a team member's `image`, a trip's `slides`), you can use
either a path like `/assets/img/your-photo.jpg` or the id of a photo that came over from Wix.

Photos that came over from Wix live in `src/assets/img/wix/` and are referred to by their old Wix
id, e.g. `{{ "1dfaf6_53881bbb8f3c40e9afc9b595befefd14" | img }}`. Small copies used in grids are in
`src/assets/img/thumbs/`.

### Writing a blog post

Create a new file in `src/posts/`, e.g. `src/posts/meizhou-2026-day-1.md`:

```markdown
---
title: "Meizhou 2026: Day 1"
date: "2026-04-01"
author: "Your Name"
categories: ["Meizhou 2026"]
cover: "/assets/img/meizhou-day1-cover.jpg"
excerpt: "One or two sentences shown on the blog page."
readTime: 3
wixSlug: "meizhou-2026-day-1"
---

Write the post here. Leave a blank line between paragraphs.

![Caption for the photo](/assets/img/meizhou-day1-lab.jpg)

<div class="post-gallery">
  <img src="/assets/img/photo-1.jpg" alt="">
  <img src="/assets/img/photo-2.jpg" alt="">
  <img src="/assets/img/photo-3.jpg" alt="">
</div>
```

`wixSlug` becomes the web address: `/post/meizhou-2026-day-1/`.

## Running it on your computer

You need [Node.js](https://nodejs.org) (version 20 or newer).

```sh
npm install
npm start        # opens a live preview at http://localhost:8080
```

## Going live

1. Push this repo to GitHub.
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` now builds and publishes the site (see the **Actions** tab).
   Until the domain is moved it's at `https://<github-user>.github.io/Envision-Edu-Site/`.

### Moving the domain off Wix

1. **Settings → Pages → Custom domain:** enter `www.envision-education.org` and save.
2. Where the domain's DNS is managed (Wix, or wherever it was bought):
   - `CNAME` record: `www` → `<github-user>.github.io`
   - `A` records for the bare domain `envision-education.org`:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Wait for DNS to update (minutes to a few hours), then tick **Enforce HTTPS**.
4. Only cancel the Wix plan once the new site loads on the real domain.

If the domain was *registered* through Wix, transfer it to a registrar such as Cloudflare or
Namecheap first (Wix → Domains → Advanced → Transfer away from Wix) so it isn't tied to the plan.

## Things Wix used to handle

- **Contact form.** Right now "Send" opens the visitor's email app, addressed to
  `envisioneducation@concordiashanghai.org`. To receive messages without that step, create a free
  [Formspree](https://formspree.io) form and paste its URL into `contactFormEndpoint` in
  `src/_data/site.json`.
- **Donations.** The donation tiers' "Give" buttons currently open an email. Wix took the payment
  itself; to take card payments again, create a payment link for each tier (Stripe, PayPal, or the
  school's giving page) and paste it into that tier's `paymentUrl` at the top of `src/donate.njk`.
- **Blog likes, comments and member profiles** aren't carried over; static sites don't have them.

## Media archive

The images on the site are resized web copies. The original full-resolution files downloaded from
Wix (164 files, about 720 MB) are kept outside this repo, in the `Envision-Media-Archive` folder
next to it. Back that folder up somewhere permanent (Google Drive, etc.): it's the only full-quality
copy once Wix is gone. `src/assets/img/manifest.json` maps each web copy to its original file name.

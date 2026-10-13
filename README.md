# The Ray of Hope Foundation: official website

React + TypeScript site with an admin dashboard, hosted on **Netlify**, with **Supabase** (PostgreSQL, sign-in, file storage) behind it. Everything runs on free tiers.

> Giving Light to Dreams Through Education and Empowerment.

## What is in the box

**Public site:** Home, About (story, mission, vision, values, objectives, approach, founder, team, governance), Programmes (list and one page each), News (search, category filter, tags, pagination, related articles, share links), Stories of Hope, Events (upcoming and past), Get Involved, Contact, FAQ, Privacy, Terms, Accessibility, custom 404.

**Dashboard (`/admin`):** overview figures, news and story editor with images, captions, preview, drafts, scheduling and a consent gate for stories, events, programmes, categories and tags, team, media library, contact inbox and newsletter list, site settings (contact details, social links, donation channels, impact figures, FAQ, legal pages), and user management for three roles.

**Server pieces (Netlify Functions):** `submit` (contact and newsletter forms, with validation, spam checks and rate limiting), `admin-users` (invite and remove staff), `sitemap` (builds `/sitemap.xml`), plus an edge function `og` (share previews for articles and stories).

## Before you start: what is real and what is a placeholder

Nothing official was invented. Items that were not supplied stay empty or are labelled **To be confirmed**:

- Email, telephone, postal address, social links, registration statement: empty until you enter them in **Site settings**. Empty items are hidden.
- Donation channels: none. The Get Involved page says channels are not open yet until you add verified ones and tick "Show donation channels".
- Impact figures: none. The home page hides the section until you add figures you can prove.
- Values and governance: marked "To be confirmed".
- Programmes: taken from the backgrounder, all set to **Planned**. Change each to Pilot or Active only when it is true.
- Privacy and Terms: plain-language drafts that describe what this site actually collects. **Have a lawyer review them.**
- Photographs: only the founder's portrait is included. No stock or invented beneficiary images are used.
- Logo and colours: the official logo (round seal) and its navy, sky blue and golden yellow palette are in place. Contact details come from the banner: therayofhopefoundationsl@gmail.com, +232 79 498642, Freetown. For a database already seeded, change them under Site settings in the dashboard.

## Set-up, step by step

### 1. Supabase (database and sign-in)
1. Create a free project at supabase.com. Choose the region nearest your visitors and save the database password somewhere safe.
2. Open **SQL Editor** and run, in order, the full contents of `supabase/migrations/0001_schema.sql`, then `0002_storage_and_seed.sql`.
3. **Authentication > Users > Add user > Create new user.** Use your own email and a strong password, and tick *Auto Confirm User*.
4. Open `supabase/first_admin.sql`, put your email in, and run it. It should say `UPDATE 1`. You are now the super administrator.
5. **Authentication > Sign In / Providers:** turn **off** "Allow new users to sign up". (Staff are invited from the dashboard instead.)
6. **Authentication > URL Configuration:** set *Site URL* to your Netlify address once you have it, and add `https://YOUR-SITE/admin/set-password` to *Redirect URLs*.
7. **Project Settings > API:** copy the *Project URL*, the *anon / publishable key*, and the *service_role / secret key*. The secret key must never go in the browser or on GitHub.

### 2. GitHub
Create a private repository and push this folder. `.env` files are git-ignored.

### 3. Netlify
1. **Add new site > Import an existing project**, choose the repository. Build settings come from `netlify.toml` (`npm run build`, publish `dist`).
2. **Site configuration > Environment variables**, add:

| Name | Value | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Project URL | public |
| `VITE_SUPABASE_ANON_KEY` | anon / publishable key | public |
| `SUPABASE_URL` | Project URL | server only |
| `SUPABASE_SERVICE_ROLE_KEY` | secret key | **server only; mark as secret** |
| `IP_HASH_SALT` | any long random text | server only |
| `SITE_URL` and `VITE_SITE_URL` | `https://your-site.netlify.app` (or your domain) | used for the sitemap and links |
| `TURNSTILE_SECRET_KEY`, `VITE_TURNSTILE_SITE_KEY` | optional | free Cloudflare Turnstile CAPTCHA |

3. Deploy. Then set `SITE_URL` to the real address, redeploy, and update the Supabase URL settings from step 1.6.
4. There is no domain yet, so the free `*.netlify.app` address works. A custom domain can be added later under **Domain management** without changing any code.

### 4. First sign-in
Go to `/admin/login`, sign in, open **Site settings** and fill in what has been confirmed. Open **Users** to invite colleagues. Each person gets an email, sets a password, and lands in the dashboard with the role you gave them.

## Roles

| Role | Can do |
|---|---|
| Super administrator | Everything, including users and deleting messages |
| Editor | Manage all content, categories, events, programmes, team, settings, messages. Publishing needs the "can publish" flag |
| Author | Write and edit their own drafts and upload images. Publishing needs the "can publish" flag |

These rules are enforced by the database (Row Level Security and triggers), not only by hiding buttons. The last active super administrator cannot be demoted, deactivated or deleted.

## Publishing news and stories
**News articles > New article.** Write, add images and captions with the toolbar, choose a category and tags, click **Preview**, then **Save as draft** or **Publish**. To schedule, set a future *Publish date and time* and publish: visitors will not see it until then. Stories work the same way, plus a **consent** box: a story cannot be published until someone confirms consent for every identifiable person, photo and personal detail (the database refuses it otherwise).

## Editing other content
Everything below is in the dashboard, no code needed: contact details and social links, donation channels, impact figures, mission/vision/values/governance, FAQ, and the Privacy/Terms/Accessibility pages (Site settings); programmes and their stage; events; team; categories and tags.

## Backups and maintenance
- Free Supabase projects have no automatic downloadable backups. Once a month, run `pg_dump` against the project (Project Settings > Database > connection string) or use the dashboard's database export, and keep the file somewhere safe. Download the media folder from Storage too.
- Free Supabase projects **pause after about a week without activity**. Visit the site or dashboard weekly, or upgrade, to avoid this. Unpausing is one click.
- Update dependencies now and then: `npm outdated`, `npm update`, then `npm run build` before pushing.
- Rotate the `service_role` key in Supabase if it is ever exposed, and update it in Netlify.

## Free-tier limits and likely future costs
Limits change, so check current figures: Netlify (build minutes, bandwidth, function invocations), Supabase (database size, storage, monthly users, project pausing), and a custom domain (roughly an annual fee). Upgrading either service is optional and only needed with sustained heavy traffic or when you want automatic backups.

## Local development
```
cp .env.example .env     # fill in the public values
npm install
npm run dev              # http://localhost:5173
npm run typecheck && npm test && npm run build
```
The functions (`/.netlify/functions/*`) need the Netlify CLI: `npx netlify dev`.

## What has and has not been tested

Tested here:
- TypeScript compiles with no errors; the production build succeeds.
- 8 unit tests for form validation and spam checks (`npm test`).
- **86 database security checks** (`supabase/tests/`) run against a real PostgreSQL 16: anonymous visitors, inactive accounts, authors, editors without publish rights, editors, and super administrators. They cover draft and scheduled-content privacy, private contact and subscriber data, no self-promotion, last-admin protection, the story consent gate, data validation and storage uploads. Supabase's sign-in layer was simulated for these tests, not the real service.
- Pages checked in a real browser at 375, 768 and 1280 px against simulated data: no sideways scrolling, one main heading per page, images with alt text, mobile menu, contact form validation and confirmation, 404 pages, unauthenticated `/admin` redirect, and that malicious HTML in an article is stripped.

**Not tested yet (needs your live accounts):**
- Real sign-in, invitation emails, password reset emails, and image uploads against your Supabase project.
- The Netlify Functions and the share-preview edge function on Netlify itself.
- Publishing a real article end to end, and the Turnstile CAPTCHA if you enable it.
- A formal accessibility audit and a legal review of the policy pages.

Please work through that list after deploying. Treat the site as ready for review, not as certified secure, until you have.

## Known limitations
- The site is a single-page app. Search engines handle this well, but share previews on WhatsApp/Facebook rely on the `og` edge function. If previews do not appear after deployment, tell the developer; a pre-rendering step can replace it.
- Email notifications for new contact messages are not included. Check **Messages** in the dashboard. (Resend or Netlify Forms notifications can be added later.)
- Article text is stored as HTML and cleaned again every time it is shown, so unsafe markup cannot run.

## Netlify notes (checked against Netlify's current guidance)

- Variables the functions read (`SUPABASE_SERVICE_ROLE_KEY`, `IP_HASH_SALT`, `TURNSTILE_SECRET_KEY`, `SITE_URL`) must be set in the Netlify dashboard under Environment variables, with the Functions scope ticked. Variables written in `netlify.toml` do not reach functions.
- Mark `SUPABASE_SERVICE_ROLE_KEY` and `IP_HASH_SALT` as secret. Never give a secret a `VITE_` prefix, because those are compiled into the public site.
- `netlify.toml` tells the build's secret scanner to ignore the four public `VITE_` values, otherwise the Supabase anon key can fail the build as a false alarm.
- Security headers in `netlify.toml` apply to pages only. The functions set their own responses in code.
- If you link a site with the Netlify CLI, keep `.netlify` in `.gitignore` (it already is).

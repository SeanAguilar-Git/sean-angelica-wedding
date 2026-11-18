# RSVP setup (one time, about 10 minutes)

The RSVP needs a small database so answers are shared between your guests and your Couple page.
It uses Vercel's free Upstash Redis. Nothing to install.

1. Upload this whole folder to GitHub (including the new `api`, `lib`, `rsvp.html`, `rsvp.js`, `rsvp.css`, `couple.html`, `couple.js`). Vercel redeploys automatically.
2. In Vercel, open your project, then **Storage** (or **Marketplace**), choose **Upstash for Redis** (free plan) and **Connect** it to this project. This adds the database keys for you.
3. In Vercel, open **Settings, then Environment Variables**, and add `ADMIN_PASSWORD` with a strong password only you and Angelica know.
4. In Vercel, open **Deployments** and **Redeploy** the latest one so the keys and password take effect.
5. Open `https://YOUR-SITE.vercel.app/couple.html`, sign in, and paste your guest list (one per line; add `, 2` for the number of seats).
6. Press **Copy link** next to each guest and send it to them. Each link is personal: it opens the invitation with their name and records their answer.

Keep `couple.html` private. It is not linked anywhere on the invitation, but anyone with the password can open it.
The RSVP only works on the deployed Vercel site, not when you open `index.html` from your computer.

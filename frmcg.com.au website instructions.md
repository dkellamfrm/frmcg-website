# FRMCG Website Instructions

## Goals
The goals of this website are to:
1. Build/Demonstrate Trust
2. Enable limited due diligence of us as a company and individuals - e.g. that we exist, are registered, have an office, key staff (3), our subsidiary businesses.
3. Sell the outcome FRM provides (for potential clients, investors, partners, suppliers, contractos, employees, referral partners etc)
4. Position FRM Australia as part of an international group - USA, Philippines, AU. With no specific links to the other sites as they don't exist yet

Goals are not oriented around traffic or conversions or any kind of funnel. It will only be accessed by people who already know who we are.

## Key Information
Trading Name: FRM Consulting Group
Legal Name: FRM Consulting Group (Aust) Pty Ltd
Address:
Suite 22 Level 1
21 South Coolum Rd
Coolum Beach
QLD 4573
Australia
ACN: 630 110 682
Phone: 0417 548 823
Industry: Financial Services

## Technical Architecture
Project type: Static multi-page marketing website with one contact form.
N.B. Menu and footer should be referenced/reusable, not duplicated.

Frontend:
- Astro
- TypeScript
- Tailwind CSS
- Static generation only
- No React unless absolutely necessary
- No database
- No auth
- No dashboard yet

Hosting:
- Cloudflare Pages
- Cloudflare DNS
- Free plan
- Deploy from GitHub

Form handling:
- Cloudflare Pages Functions
- Endpoint: /api/contact
- Method: POST
- Validate input server-side
- Use Cloudflare Turnstile for spam protection
- Append submission to Google Sheets
- Send email notification via Resend

Form fields:
- First name
- Last name
- Email
- Phone
- Company
- Message
- Source page
- Timestamp
- IP / user-agent metadata if useful
Send submission to admin@frmcg.com.au

Google Sheets:
- Use Google Sheets API
- Append each submission as a new row
- Store credentials as Cloudflare environment secrets
- Never expose credentials client-side

Email:
- Use Resend
- Send internal notification email on every valid submission
- Optional: send confirmation email to user
- Domain must be verified in Resend

Security:
- Turnstile required
- Honeypot hidden field
- Server-side validation
- Basic rate limiting if easy
- No secrets in frontend code
- CORS locked to production domain

Deployment:
- GitHub repo connected to Cloudflare Pages
- Build command: npm run build
- Output directory: dist
- Environment variables configured in Cloudflare Pages

Environment variables:
- RESEND_API_KEY
- NOTIFICATION_EMAIL
- GOOGLE_SHEETS_CLIENT_EMAIL
- GOOGLE_SHEETS_PRIVATE_KEY
- GOOGLE_SHEETS_SPREADSHEET_ID
- GOOGLE_SHEETS_SHEET_NAME
- TURNSTILE_SECRET_KEY
- PUBLIC_TURNSTILE_SITE_KEY

Recommended folder structure:
/
  src/
    components/
    layouts/
    pages/
      index.astro
      contact.astro
  functions/
    api/
      contact.ts
  public/
  astro.config.mjs
  tailwind.config.mjs
  package.json
  README.md

## Site Architecture
- Home Page
- Our Companies
We will list 5 subsidiaries, each with logo, name, description and link to its website
PMA: Property Management Australia - pmaqld.com
SSA: Surfside Accounting Services - surfsideaccounting.com.au
SOFA: Solar Finance Australia - solarfinanceaustralia.com.au
RFA: Reno Finance Australia - renofinanceaustralia.com.au
SFA: Specialised Finance Australia - sfa.net.au
- Executive Team
3 people. Image. Name. Title. 1-para bio each.
Tony Devin, Group CEO
David Kellam, CMO & CTO
Brendan Robinson, Group Business Development Manager

Images in images/headshots/
Bios use lorem ipsum for now
- Contact
Will have contact form per above spec, office with embedded maps, phone number

## Design
Use images/logos/FRM.png as logo
Pull colours out and use across the site
Make it professional.
Use content-relevant logos or stock-style imagery where appropriate
Feel free to add design elements like horizontal lines and so forth.

## Content
An investor pack is in content input/
We only want outward-facing customer-centric content. Not internal or investor content.
No numbers. No mention of multiple streams of revenue. Needs to be outcome-focused
e.g. Why we run multiple integrated businesses.
Use call transcript.txt as inspiration when talking about the FRM site (first part of the call, then we talk about surfside and pma - irrelevant here) for some language around the outcome we provide.
Old site is here: https://web.archive.org/web/20251125135658/https://frmcg.com.au/ (Let me know if you can't access).

## Deployment Instructions
Tell me what I need to create in terms of accounts, APIs, secrets etc to execute the deployment.
  1. GitHub — Create a repo and push this code                                                                                                                                   
  2. Cloudflare Pages — Connect the GitHub repo, set build command npm run build, output directory dist                                                                        
  3. Cloudflare Turnstile — Create a site widget at dash.cloudflare.com → Turnstile. Replace TURNSTILE_SITE_KEY_PLACEHOLDER in contact.astro with your actual site key           
  4. Resend — Create account, verify frmcg.com.au domain, get API key                                                                                                            
  5. Google Sheets — Create a spreadsheet, create a Google Cloud service account with Sheets API enabled, download credentials                                                   
  6. Cloudflare Environment Variables — Set these in Pages settings:                                                                                                             
RESEND_API_KEY
NOTIFICATION_EMAIL → admin@frmcg.com.au
GOOGLE_SHEETS_CLIENT_EMAIL                                                                                                                          GOOGLE_SHEETS_PRIVATE_KEY                                                                                                                           GOOGLE_SHEETS_SPREADSHEET_ID                                                                                                                        GOOGLE_SHEETS_SHEET_NAME                                                                                                                            TURNSTILE_SECRET_KEY   

Local Hosting:
http://localhost:4321

## Q&A
Ask questions to clarify. I will update this file to add answers under here.

## Fixes
### v1
Bottom left logo
### v2
Add TFC = Task Force Consulting
Logo added.
Asset Finance for Machinery etc.
### v3
Can we make the logo for the bottom left purely white on the blue? i.e. get rid of the colours and grey and just make it a white vector outline?
## v4

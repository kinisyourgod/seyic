SEYIC REFRACTORY - WEBSITE FILES
================================

Open index.html in a browser to preview the site. All pages are plain HTML, so
no build step is needed.

FILES
  index.html        Home
  about.html, services.html, projects.html, news.html, faq.html, contact.html
  ewekoro.html ... libya.html     The 12 project pages
  article1.html ... article3.html News articles
  style.css, site.js              Shared styles and behaviour (keep with the pages)

PUT IT ON GITHUB PAGES
  1. Create a free account and a new public repository at github.com
     (for example: seyic-website).
  2. Click "Add file" > "Upload files" and drag in EVERYTHING in this folder
     (all the .html files, style.css and site.js). Commit.
  3. Go to Settings > Pages. Under "Build and deployment", choose
     "Deploy from a branch", select the main branch and the / (root) folder.
     Save. The site goes live at https://YOUR-USERNAME.github.io/seyic-website/
  4. Custom domain: in Settings > Pages, enter seyicrefractoryng.com and save.
     At your domain registrar add these DNS records:
       A     @     185.199.108.153
       A     @     185.199.109.153
       A     @     185.199.110.153
       A     @     185.199.111.153
       CNAME www   YOUR-USERNAME.github.io
     Then tick "Enforce HTTPS" once it becomes available (can take up to a day).
     Check GitHub's current instructions before changing DNS, because records can change.

CONNECT THE CONTACT FORM (so enquiries reach your email)
  1. Sign up free at formspree.io and create a form using the email address that
     should receive enquiries. Copy the form ID (looks like xyzabcde).
  2. In contact.html, find:
       action="https://formspree.io/f/YOUR_FORM_ID"
     and replace YOUR_FORM_ID with your real ID. Upload the file again.
  Until you do this the form shows a "not connected yet" message and sends nothing.

STILL TO REPLACE WITH REAL CONTENT (search the HTML for square brackets [ ])
  - Team names, roles and bios (about.html)
  - Testimonials (index.html, projects.html)
  - News posts and article text (news.html, article1-3.html)
  - Project overview, scope, year and duration (each project page)
  - Photos: the photo areas are empty boxes. To add a photo, put the image file in
    the folder and replace the placeholder box with an <img src="photo.jpg" alt="...">
  - Phone number +234 803 123 4567 and the address were copied from the old site.
    Confirm they are correct (the phone number looks like a sample).

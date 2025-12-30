# music-pink-devops
DevOps assessment – Cloudflare-based web application

Deployment information- 
Frontend: Deployed using Cloudflare Pages (static hosting and CDN)
Backend&API: Deployed using Cloudflare Workers using Wrangler (IaC)

Infrastructure as Code (IaC)-
apps/api/wrangler.jsonc defines the Worker deployment configuration (name, entry point, environment settings and bindings).
Because it is stored in Git and used by the deployment pipeline, it acts as Infrastructure as Code.


Notes:
Continuous Integration runs on pull requests to main, validating backend tests and frontend static asset integrity.
Continuous Deployment runs on pushes to main using GitHub Actions and Wrangler.
The backend API is deployed as a Cloudflare Worker from apps/api.
The frontend is deployed to Cloudflare Pages from apps/web (project: music-pink-web).
Secrets (API tokens and account IDs) are stored securely using GitHub Actions Secrets.

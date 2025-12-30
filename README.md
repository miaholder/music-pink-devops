# music-pink-devops
DevOps assessment – Cloudflare-based web application

Deployment information- 
Frontend: Deployed using Cloudflare Pages (static hosting and CDN)
Backend&API: Deployed using Cloudflare Workers using Wrangler (IaC)

Infrastructure as Code (IaC)-
apps/api/wrangler.jsonc defines the Worker deployment configuration (name, entry point, environment settings and bindings).
Because it is stored in Git and used by the deployment pipeline, it acts as Infrastructure as Code.


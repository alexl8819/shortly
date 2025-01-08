# shortly
Basic URL shortner

## Implementation

- Hosting (website and database): Vercel and Supabase

Vercel seemed like an easy choice for hosting a full stack application as it requires little effort to setup. All backend API routes
use Supabase to connect to a dedicated Postgres^ instance via the Supabase JS client as well as an auth provider to handle user management, 
making it effortless to focus solely on the app. This solution emphasisizes a managed setup, which significantly speeds up development time.

**^Admittedly, this was not the best choice as something like SQLite or libSQL would have sufficed as there is low traffic, rather this decision was based on familiarizing myself with the Supabase platform**

- Framework: Astro and React 

Astro provides nearly everything needed out of box to get up and running quickly for a multi-page website. Components that were more complex
or needed client-sided interactivity were built with React using Astro's third party integration system. Both Astro and React do well with 
server-side rendering making each page quick to access.

- Styling: Tailwind CSS and Figma

Astro allows third party integration with Tailwind CSS by importing the required configuration files and plugins into Astro's configuration. Figma
was used as the wireframe for designing the site provided free by FEM.

- Security: Supabase

Currently, xss is mitigated using cookies and input sanitization. Measures against CSRF has not yet been implemented or tested for. ~~Supabase silently handles CSRF token handling when using their authentication API~~. The future focus will be on the [OWASP checklist](https://owasp.org/www-project-web-security-testing-guide/assets/archive/OWASP_Web_Application_Penetration_Checklist_v1_1.pdf) to ensure best standards are used.

- Testing: Vitest and Cypress

For unit tests, vitest will be used to test components and cypress will be used for e2e.

- Accessibility: Adobe Aria

React Aria is used for building accessable components in React.

## TODO
Please check current issues
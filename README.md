# discord-bot
A customized Discord bot built for personal use and hosted on a Google Cloud VM.

**Core Stack**: JavaScript/Node.js/PM2 (Node.js and PM2 for uptime and monitoring, live deployment on a Google Cloud VM)  
**Why this stack**: JavaScript was my first language as a self-taught programmer, so this pet project served as a playground for my newfound skillset at the time, serving as a general entry point into the world of programming.  

**Features:**
- Interacts with Discord API endpoints inaccessible through the UI (e.g. `/role color change` command that allows users selective access to sensitive permissions unachievable using the Discord GUI)
- Integrates a basic AI feature (`/gemini` command that prompts Gemini AI and returns a response)
- Exposes third-party APIs to provide extra functionality to end users (e.g. `/mediawiki random` command that returns a random Wikipedia article)

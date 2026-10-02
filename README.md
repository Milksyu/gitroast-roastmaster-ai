# GitRoast & RoastMaster AI

![GitRoast & RoastMaster AI Banner](https://via.placeholder.com/1200x400/6366f1/ffffff?text=GitRoast+%26+RoastMaster+AI)

A playful, AI-driven tool that generates humorous code roasts, RPG-style developer stats cards, and 8-bit avatars from GitHub profiles. Built for the AppBuildersPH Hackathon.

## ✨ Features

- **Playful Code Roasts**: Get hilarious, lighthearted roasts about coding style, commit messages, and project structure
- **RPG Developer Cards**: Generate shareable trading cards with titles like "Code Ninja Level 4" or "404 Bug Wizard"
- **8-bit Avatar Suggestions**: Get pixel art avatar ideas based on your primary programming languages
- **Real-time Data**: Fetches live data from GitHub API (repos, commits, profile info)
- **AI Powered**: Uses OpenRouter API with Llama 3.3 70B for intelligent roast generation
- **Beautiful UI**: Built with Next.js 14, Tailwind CSS, Framer Motion, and Lucide Icons
- **Responsive**: Works on mobile and desktop
- **Fallback System**: Never fails - uses intelligent fallbacks when APIs are unavailable

## 🚀 Live Demo

Try it out: [https://gitroast-roastmaster-ai.vercel.app](https://gitroast-roastmaster-ai.vercel.app)

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **AI**: [OpenRouter API](https://openrouter.ai/) (Llama 3.3 70B)
- **Data**: [GitHub REST API](https://docs.github.com/en/rest)
- **Deployment**: [Vercel](https://vercel.com/)

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Milksyu/gitroast-roastmaster-ai.git
   cd gitroast-roastmaster-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   GITHUB_TOKEN=your_github_personal_access_token_here
   ```

4. Get your API keys:
   - [OpenRouter API Key](https://openrouter.ai/keys)
   - [GitHub Personal Access Token](https://github.com/settings/tokens) (repo scope not needed for public data)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Architecture

```
├── app/                    # Next.js 14 App Router
│   ├── api/                # API Routes
│   │   ├── generate-roast/ # Main generation endpoint
│   │   └── roast/          # GitHub data fetching
│   ├── page.tsx            # Main page component
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── lib/                    # Utility functions and services
│   └── ai/                 # AI services
│       └── openrouter.ts   # OpenRouter integration
├── public/                 # Static assets
├── styles/                 # CSS styles
└── package.json            # Dependencies and scripts
```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API key for AI roast generation | Yes |
| `GITHUB_TOKEN` | GitHub personal access token (increases rate limit) | No (but recommended) |

## 📱 Usage

1. Enter any GitHub username in the input field
2. Click "Roast Me!"
3. Enjoy your playful roast and RPG-style developer card
4. Share your results or try another username!

## 💡 Development Notes

### API Rate Limits
- GitHub API: 60 requests/hour without token, 5,000/hour with token
- OpenRouter API: Depends on your plan
- Built-in caching reduces API calls
- Fallback responses ensure the app never fails

### Error Handling
- Graceful handling of API failures
- User-friendly error messages
- Rate limit detection and user notifications
- Intelligent fallback system for offline/demo use

## 🎯 Hackathon Submission Components

✅ **GitHub Repository**: Clean structure, `.env.example`, comprehensive README  
✅ **Live Web App**: Deployed on Vercel with low latency  
✅ **Slide Deck & Pitch**: Ready for 3-minute presentation  

## 🚀 Deployment

This app is ready for one-click deployment on Vercel:

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

Alternatively, deploy manually:
```bash
vercel
```

## 📄 License

MIT License - feel free to use and modify for your own projects!

## 🙏 Acknowledgements

- [AppBuildersPH](https://appbuilders.ph/) for the hackathon
- [OpenRouter](https://openrouter.ai/) for AI model access
- [GitHub](https://github.com/) for developer data
- [Vercel](https://vercel.com/) for hosting
- All the open-source libraries that made this possible

---

**Made with ❤️ for AppBuildersPH Hackathon**  
*24 HOURS. BUILD. SHIP. DEMO.*

<p align="center">
  <a href="https://vercel.com?utm_source=gitroast-roastmaster-ai&utm_campaign=oss">Powered by Vercel</a>
</p>
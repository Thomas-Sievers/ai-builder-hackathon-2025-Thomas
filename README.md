# EsportsConnect - Professional Network for Gamers

A modern social media platform designed specifically for the esports community. Connect with players, teams, and scouts to build your esports career.

## 🎮 Features

- **Esports CV Profiles**: Showcase your gaming achievements, ranks, and highlight reels
- **Content Sharing**: Post gameplay clips and articles with the community
- **Championships**: Discover and participate in tournaments and competitions
- **Networking**: Advanced search to find players by game, rank, and role
- **Team Pages**: Create and manage team profiles
- **Premium Subscriptions**: Enhanced features for teams and scouts

## 🎯 Supported Games

- **Counter-Strike 2**: Rank, Faceit Level, ESEA Rank
- **League of Legends**: Rank, Division, LP, Main Role
- **Valorant**: Rank, Act Rank, Main Role
- **Dota 2**: MMR, Medal, Main Role

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Postgres, Auth, APIs)
- **Authentication**: Supabase Auth with OAuth providers
- **Deployment**: Vercel
- **Design**: Dark theme with blue neon accents

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd esports-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials and OAuth provider keys.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── lib/                # Utility functions and configurations
└── types/              # TypeScript type definitions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Design System

The platform uses a dark theme with blue neon accents:

- **Primary Colors**: Blue neon (#00BFFF) for accents and CTAs
- **Background**: Deep black (#0A0A0A) for main background
- **Cards**: Dark gray (#1A1A1A) for content cards
- **Text**: Light gray (#E5E5E5) for primary text

### Custom CSS Classes

- `.neon-blue` - Blue neon text with glow effect
- `.neon-border` - Blue neon border with glow
- `.neon-glow` - Blue neon box shadow

## 🔐 Authentication

Supports multiple OAuth providers:
- Google
- Discord
- Steam
- Epic Games
- Riot Games

## 💳 Premium Features

Premium subscriptions include:
- Enhanced team profiles
- Advanced analytics
- Priority support
- Custom branding options

## 📱 Responsive Design

Mobile-first approach with responsive breakpoints:
- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+
- Large: 1280px+

## 🧪 Testing

- Unit tests with Jest and React Testing Library
- E2E tests with Playwright
- Component testing with Storybook

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm run start
```

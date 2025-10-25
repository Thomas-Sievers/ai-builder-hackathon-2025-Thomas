Let's build an MVP social media platform for the esports community. The project will function as a professional network (think LinkedIn for gamers) where aspiring players, teams, and scouts can connect. 

The core features will be user profiles that act as an "esports CV", a post system for sharing gameplay clips and articles, and a browsable list of championships.

Requirements:

    Robust user profiles that act as an 'esports CV', showcasing games played, ranks, roles, and a video highlight reel.

    A post system for users to share video clips (e.g., by embedding from YouTube/Twitch) and text-based articles or updates.

    A dedicated page to list upcoming amateur and professional championships, with filters for game and region.

    Core networking features, including a powerful search to find players by game, rank, and role, as well as simple team pages.

    Add unit tests for business logic and E2E tests for core user journeys.

Design:

    Minimal, functional, and practical design, focused on usability.

    A dark/black theme as the base.

    Use blue neon colors for accents, links, and calls to action.

    Inspired by modern social media layouts (e.g., clean cards, intuitive navigation).

Frontend:

    Next.js (App Router)

    React

    TypeScript

    Tailwind CSS

    shadcn/ui for pre-built, accessible components that fit the minimal design.

    Prettier and ESLint for code formatting and quality.

Backend:

    Supabase for the entire backend.

        Database: Supabase Postgres.

        Authentication: Supabase Auth to handle email/password and OAuth (Discord, Steam, Epic Games, Riot, Google).

        APIs: Use the Supabase client library (@supabase/ssr) to interact with the database and auth.

Infra:

    GitHub for version control.

    Vercel for deployment.

Our first task is for you to create the development plan.

Based on all the context above, generate a detailed, phased development roadmap for building this MVP. Break the work down into logical stages (e.g., Phase 0: Setup, Phase 1: Core Features, etc.) and list the specific tasks for each phase.

Place this roadmap inside a new plan.md file.

General Process to Follow:

    As we work through the roadmap you create, check off completed items using a todo list format (- [x]).

    If you have open questions that require my input, add those directly into the plan.md.

    Make regular, well-explained but concise commits.

    Create and continuously update a README.md file as we add features and set up the project.
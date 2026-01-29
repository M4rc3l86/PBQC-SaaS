# PBQC Project Context

## Tech Stack

- **Next.js 16+** - React framework with App Router
- **TypeScript 5+** - Type-safe JavaScript
- **Tailwind CSS 4+** - Utility-first CSS framework
- **Supabase** - Backend as a Service (database, auth, storage)

## Folder Structure

```
pbqc-saas/
├── src/
│   ├── app/           # App Router pages and layouts
│   ├── components/    # Reusable React components
│   ├── lib/           # Utility libraries (Supabase client, helpers)
│   └── ...
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## Environment Variables

Create a `.env.local` file in the project root based on `.env.local.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

**Important:** Use the new **publishable key** (`sb_publishable_...`) instead of the legacy `anon` key. The publishable key is the recommended approach for client-side Supabase operations.

## Development

```bash
npm run dev
```

Starts the development server on http://localhost:3000

## Next Steps

1. Set up your Supabase project and copy the URL and publishable key to `.env.local`
2. Configure Supabase database tables and policies
3. Implement authentication with Supabase Auth
4. Build out application features

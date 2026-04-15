# Agent Instructions — VillagePrep Overhaul

Read `implementation_plan.md` in its entirety before writing a single line of code. Execute the plan **phase by phase in strict order**.

---

## CRITICAL: Be Thorough, Not Fast

**DO NOT rush through phases.** Each phase involves real, production-grade changes. Here is what "thorough" means:

- **Phase 1A (Git/Secrets)**: Don't just edit `.gitignore`. Also create `.env.example`, verify every env var, clean up the duplicate root-level `.env.local` reference.
- **Phase 1B (Auth)**: Build a COMPLETE authentication system. That means: a Supabase `auth_codes` table with expiry, rate limiting logic, a JWT or session cookie implementation, a `middleware.ts` that protects routes, AND update the frontend login flow to work with the new backend. Test the full flow mentally — register, send code, verify code, get session, make authenticated API call, logout.
- **Phase 1C (AI)**: Keep Gemini 1.5 Flash. Do NOT switch providers. Add streaming, fix the content truncation, add error handling for missing key.
- **Phase 2 (Decomposition)**: This is the biggest phase. You are splitting a 1,956-line file into 30+ components. Each component must be fully functional, properly typed, and visually identical to the current design. Create EVERY file listed in the plan — `components/ui/`, `components/layout/`, `components/landing/`, `components/auth/`, `components/student/`, `components/study/`, `components/teacher/`, `components/shared/`, `contexts/`, `hooks/`, `types/`, `utils/`.
- **Phase 3 (Database)**: Write the full migration SQL. Include all tables, constraints, indexes, and RLS policies.
- **Phase 4+ (Features)**: Each feature must be complete with error handling, loading states, empty states, and mobile responsiveness.

**For EVERY phase:**
1. List all files you will create, modify, or delete
2. Make ALL the changes — do not leave TODOs or placeholders
3. Run `npm run build` and fix every error
4. Run `npx tsc --noEmit` and fix every type error
5. Summarize what you changed, what's working, and what's next

---

## Non-Negotiable Rules

1. **AI Provider is Gemini 1.5 Flash.** The env var is `GEMINI_API_KEY`. Do NOT switch to OpenRouter, OpenAI, or anything else. The user will add the key later.
2. **Tech stack**: Next.js 16, TypeScript, Supabase, TailwindCSS v4. Do not change this.
3. **Visual design**: Dark theme (`#0a0a0f` bg), teal accent (`#14b8a6`), glassmorphism, Sora/DM Sans/Libre Baskerville fonts. The app must look the SAME or BETTER after refactoring. If it looks worse, you have failed.
4. **Do not delete unrelated comments or docstrings.**
5. **All API routes** must validate inputs and return proper error responses. Never trust client data.
6. **No placeholders.** Every component you create must be fully implemented, not a stub.
7. **Never commit `.env.local` to git.**

---

## Current State Summary

- Next.js 16 app. Working directory is `./`
- Entire frontend is one file: `app/page.tsx` (1,956 lines). This must be decomposed.
- 13 API routes under `app/api/` — most work but have no auth protection.
- Database: Supabase (client at `lib/supabase.ts`).
- AI route uses Gemini 1.5 Flash. It works when `GEMINI_API_KEY` is set.
- PDF parsing is disabled (returns error). Must be fixed.
- Auth is insecure — OTP code stored in plain browser cookies.
- `lib/store.ts` has in-memory stores that reset on server restart (fine for dev, needs Supabase for prod).

---

## Execution Order

**Phase 1A** → **Phase 1B** → **Phase 1C** → **Phase 2** → **Phase 3** → **Phase 4A** → **Phase 4B** → **Phase 4C** → **Phase 4D** → **Phase 4E** → **Phase 5** → **Phase 6** → **Phase 7**

Start with Phase 1A now. When you finish ALL of Phase 1 (A, B, and C), move to Phase 2. Do not skip phases.

Begin.

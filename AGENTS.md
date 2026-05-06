<!-- BEGIN:nextjs-agent-rules -->

# Link Shortener Project - Agent Instructions

This is a Next.js 16 link shortener application with **strict coding standards**. All LLM agents working on this project MUST follow the comprehensive guidelines in the `/docs` directory.

## Quick Reference

### Technology Stack

- **Framework**: Next.js 16.2.4 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Auth**: Clerk v7.2.7
- **UI**: shadcn/ui + Tailwind CSS v4
- **Icons**: Lucide React

### Key Principles

1. **Server Components First**: All components are Server Components by default. Only add `'use client'` when you need browser APIs, event handlers, or React hooks.

2. **Type Safety**: Infer types from Drizzle schemas. No manual type definitions for database entities.

3. **Path Aliases**: Always use `@/` imports, never relative paths.

4. **No API Routes for Internal Data**: Fetch directly in Server Components. API routes are for external access only.

5. **Tailwind Utilities**: Use Tailwind classes, not custom CSS or inline styles.

### Common Mistakes to Avoid

❌ Using `getServerSideProps` or `getStaticProps` (Pages Router patterns)
❌ Adding `'use client'` unnecessarily
❌ Creating API routes for internal data fetching
❌ Using relative imports instead of `@/` aliases
❌ Forgetting to check authorization in Server Actions
❌ Using `any` type in TypeScript
❌ Ignoring Clerk authentication patterns
❌ Creating custom UI components instead of using shadcn/ui

### Before You Code - Mandatory Checklist

**⚠️ STOP! Complete these steps IN ORDER before writing any code:**

1. **Check existing code** for similar patterns in the codebase
2. **Follow TypeScript strict mode** (no `any`, proper types)
3. **Test authentication** if touching protected routes
4. **Validate user input** before database operations

**If you skip step 1, your code WILL be wrong.** The documentation contains project-specific requirements that override general Next.js patterns.

## Documentation Structure

Each documentation file contains:

- ✅ Correct patterns with examples
- ❌ Anti-patterns to avoid
- 📋 Best practices
- ⚠️ Common pitfalls
- 💡 Usage examples

## Questions?

If you're unsure about a pattern:

1. Look for similar code in the project
2. Follow the "do's" and avoid the "don'ts"
3. When in doubt, ask for clarification

**Remember**: This is Next.js 16 with breaking changes. Your training data may be outdated. Always verify against these docs.

<!-- END:nextjs-agent-rules -->

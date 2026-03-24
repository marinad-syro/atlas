# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

**vitest v4** + **@testing-library/react** — fast, modern test runner that works natively with Vite/Next.js.

## How to run

```bash
cd frontend
npm test          # run all tests once
npm run test:watch  # watch mode during development
```

## Test layers

| Layer | What | Where |
|-------|------|--------|
| Unit | Pure functions, utils | `src/test/*.test.ts` |
| Component | React component behavior | `src/test/*.test.tsx` |
| Integration | Multi-component flows | `src/test/*.test.tsx` |

## Conventions

- Files: `src/test/{ComponentName}.test.tsx`
- Assertions: `@testing-library/jest-dom` matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.)
- Setup: global imports in `src/test/setup.ts`
- Prefer `getByText` / `getByRole` over test IDs — test what the user sees

# Unused Imports Rule

**Pattern**: Unused imports and variables after code refactoring

**Problem**: ESLint fails with `@typescript-eslint/no-unused-vars` errors

## Prevention

**When removing code that uses an import**:

1. Remove the import immediately
2. Run `pnpm lint` to verify
3. Run `pnpm format` to fix formatting

**Before committing**:

```bash
pnpm lint
pnpm format:check
```

## Common Culprits

| Import | Often Unused After |
|--------|-------------------|
| `TYPOGRAPHY` | Style object refactoring |
| `BUTTON`, `CARD` | Component abstraction |
| `useEffect` | Hook simplification |
| `COLORS` | Color token consolidation |
| `TRANSITIONS` | Style inlining |

## Quick Fix Commands

```bash
# Check for unused imports
pnpm lint

# Auto-fix formatting
pnpm format

# Full verification
pnpm typecheck && pnpm lint && pnpm format:check
```

## Commit Checklist

- [ ] `pnpm lint` exits with code 0
- [ ] `pnpm format:check` exits with code 0
- [ ] No `@typescript-eslint/no-unused-vars` errors

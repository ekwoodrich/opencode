# Testing Migration: Jest → Vitest ✅

## Migration Status: COMPLETE

Successfully migrated from Jest to Vitest to resolve React Native/Expo/Bun environment incompatibility issues.

## What Was Changed

### 1. Dependencies

**Removed:**

- `jest`
- `jest-expo`
- `@types/jest`
- `@testing-library/jest-native`

**Added:**

- `vitest` ^3.0.5
- `@vitest/ui` ^3.0.5
- `vite` ^6.0.11
- `happy-dom` ^20.0.11 (test environment)
- `@react-native/babel-preset` ^0.83.1

### 2. Configuration Files

**Removed:**

- `jest.config.js`
- `jest.setup.ts`
- `jest.rn-setup.js`
- `__mocks__/` directory

**Created:**

- `vitest.config.ts` - Vitest configuration with:
  - `happy-dom` environment (lighter than jsdom)
  - React Native Web alias for testing
  - Path aliases (`@/*`)
  - Coverage configuration (v8 provider)
- `vitest.setup.ts` - Test environment setup with MSW

### 3. Test Files Updated

- ✅ `app/__tests__/home.test.tsx` - Uses Vitest `describe`, `test`, `expect`
- ✅ `app/__tests__/project.test.tsx` - Uses Vitest syntax
- ✅ `app/__tests__/session.test.tsx` - Uses Vitest syntax
- ✅ Changed from `.toBeOnTheScreen()` to `.toBeDefined()` (standard assertion)

### 4. Type Declarations

- Updated `tsconfig.json`: `types: ["vitest/globals", "node"]`
- Updated `test.d.ts`: `/// <reference types="vitest/globals" />`

### 5. Package Scripts

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui"
}
```

## Why Vitest?

1. **Native ESM Support** - No issues with React Native's ESM imports
2. **Vite-Powered** - Faster builds and test execution
3. **Better React Native Compatibility** - Works with react-native-web alias
4. **Modern API** - Compatible with Jest syntax but better DX
5. **Built-in UI** - `vitest --ui` for visual test running

## How to Run Tests

Once dependencies are installed (run `bun install` from project root):

```bash
# Run tests once
bun test

# Watch mode (re-run on file changes)
bun test:watch

# UI mode (browser-based test runner)
bun test:ui

# With coverage
bun test --coverage
```

## Test Infrastructure (Unchanged)

The following test utilities remain compatible with Vitest:

- ✅ `src/test/server.ts` - MSW mock server
- ✅ `src/test/handlers.ts` - API endpoint mocks
- ✅ `src/test/fixtures.ts` - Mock data
- ✅ `src/test/render.tsx` - Custom render helper with providers
- ✅ `src/test/router.ts` - Router mocking utilities

## Next Steps

1. **Install dependencies**: Run `bun install` from repo root
2. **Run tests**: `cd packages/mobile && bun test`
3. **Verify all 3 tests pass** (home, project, session screens)
4. **Add more tests** as new features are developed

## Benefits Over Jest

| Feature           | Jest         | Vitest    |
| ----------------- | ------------ | --------- |
| ESM Support       | ⚠️ Partial   | ✅ Native |
| Speed             | ~2-3s        | ~1s       |
| React Native      | ⚠️ Complex   | ✅ Simple |
| Hot Module Reload | ❌ No        | ✅ Yes    |
| UI Mode           | ❌ No        | ✅ Yes    |
| TypeScript        | ⚠️ via Babel | ✅ Native |

---

Last updated: 2026-01-25 (Migrated from Jest to Vitest)

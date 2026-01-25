# Mobile App Testing with Vitest

## Quick Start

```bash
# Install dependencies (from repo root)
bun install

# Run tests
cd packages/mobile
bun test

# Watch mode
bun test:watch

# UI mode (browser interface)
bun test:ui
```

## Test Structure

```
packages/mobile/
├── app/
│   └── __tests__/          # Screen tests
│       ├── home.test.tsx
│       ├── project.test.tsx
│       └── session.test.tsx
├── src/
│   └── test/               # Test utilities
│       ├── server.ts       # MSW mock server
│       ├── handlers.ts     # API mocks
│       ├── fixtures.ts     # Mock data
│       ├── render.tsx      # Render helper
│       └── router.ts       # Router mocks
├── vitest.config.ts        # Vitest configuration
└── vitest.setup.ts         # Global test setup
```

## Writing Tests

### Basic Test Example

```typescript
import { describe, test, expect } from 'vitest'
import { screen } from '@testing-library/react-native'
import { renderWithProviders } from '@/src/test/render'
import MyScreen from '../my-screen'

describe('MyScreen', () => {
  test('renders correctly', async () => {
    renderWithProviders(<MyScreen />)

    expect(await screen.findByText('Hello')).toBeDefined()
  })
})
```

### Testing with Route Params

```typescript
import { setParams } from '@/src/test/router'

test('loads data for project', async () => {
  setParams({ dir: '/my/project' })

  renderWithProviders(<ProjectScreen />)

  expect(await screen.findByText('my-project')).toBeDefined()
})
```

### Mocking API Responses

```typescript
import { server } from '@/src/test/server'
import { http, HttpResponse } from 'msw'

test('handles API errors', async () => {
  server.use(
    http.get('/api/projects', () => {
      return HttpResponse.json({ error: 'Failed' }, { status: 500 })
    })
  )

  renderWithProviders(<HomeScreen />)

  expect(await screen.findByText('Error loading projects')).toBeDefined()
})
```

## Configuration

### vitest.config.ts

- **Environment**: `happy-dom` (lightweight DOM for React Native Web)
- **Globals**: Enabled (`describe`, `test`, `expect` available globally)
- **Aliases**: `@/*` maps to project root
- **React Native**: Aliased to `react-native-web` for testing

### vitest.setup.ts

Global setup that runs before all tests:

- Starts MSW mock server
- Mocks `expo-router`
- Mocks `AsyncStorage`
- Cleans up after each test

## Available Test Utilities

### `renderWithProviders(component)`

Renders component with required providers:

- `PlatformProvider` - Platform abstraction
- `ServerProvider` - Server URL context

### Router Mocking

```typescript
import { setParams, getRouter, resetParams } from "@/src/test/router"

setParams({ id: "123", dir: "/path" }) // Set route params
getRouter() // Get mock router
resetParams() // Clear params (auto-called after each test)
```

### Mock Data

```typescript
import { fixtures } from "@/src/test/fixtures"

fixtures.project // Mock project data
fixtures.session // Mock session data
fixtures.messages // Mock message array
fixtures.files // Mock file array
```

## Coverage

```bash
# Generate coverage report
bun test --coverage

# View HTML report
open coverage/index.html
```

Coverage configuration in `vitest.config.ts`:

- Provider: `v8`
- Reporters: text, json, html
- Excludes: node_modules, tests, config files

## Troubleshooting

### "Cannot find module 'vitest'"

Run `bun install` from repo root to install dependencies.

### Tests timeout

Increase timeout in test file:

```typescript
test(
  "slow test",
  async () => {
    // ...
  },
  { timeout: 10000 },
) // 10 seconds
```

### Mock not working

Ensure mocks are defined in `vitest.setup.ts` or before the test:

```typescript
import { vi } from "vitest"

vi.mock("my-module", () => ({
  myFunction: vi.fn(),
}))
```

## Best Practices

1. **Use `describe` blocks** to group related tests
2. **Use `findBy*` queries** for async content (waits for element)
3. **Reset mocks** after each test (done automatically in `vitest.setup.ts`)
4. **Test user behavior**, not implementation details
5. **Keep tests focused** - one assertion per test when possible

## Migration from Jest

If migrating existing Jest tests:

1. Replace `jest.fn()` with `vi.fn()`
2. Replace `jest.mock()` with `vi.mock()`
3. Import `describe`, `test`, `expect` from `'vitest'`
4. Use `.toBeDefined()` instead of `.toBeOnTheScreen()`
5. No need for `@testing-library/jest-native`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library (React Native)](https://callstack.github.io/react-native-testing-library/)
- [MSW Documentation](https://mswjs.io/)

---

For questions or issues, see `TESTING_BLOCKERS.md` for migration notes.

# OpenCode React Native / Expo App Proposal

## Goals and scope

- Ship a new Expo app that runs on Android, iOS, and React Native Web with feature parity to the current web UI.
- Reuse the existing OpenCode server API and JS SDK to stay compatible with upstream web UI improvements.
- Establish a platform adapter layer so native capabilities (notifications, file pickers, background tasks) can be added over time.

## Current web UI architecture (reference)

- Web UI lives in `packages/app` and is a SolidJS + Vite application.
- Entry is `packages/app/src/entry.tsx`, which sets the platform to `web` and wires `PlatformProvider`.
- Routing is defined in `packages/app/src/app.tsx` using Solid Router, with home at `/` and session routes under `/:dir/session/:id?`.
- The platform interface is defined in `packages/app/src/context/platform.tsx` and includes openLink, notify, storage, file pickers, update hooks, and fetch overrides.
- Persistent storage uses `packages/app/src/utils/persist.ts`, with localStorage on web or `platform.storage` on desktop.

## Current feature set to replicate

- Server selection and health checks (dialog and status indicators) via `packages/app/src/components/dialog-select-server.tsx`.
- Project list and project selection via `packages/app/src/pages/home.tsx` and `packages/app/src/components/dialog-select-directory.tsx`.
- Session list, session detail view, message history, and prompt input flow via `packages/app/src/pages/session.tsx` and `packages/app/src/components/prompt-input.tsx`.
- File browser and file viewer with tabs, diff views, and context selection via `packages/app/src/context/file.tsx` and `packages/app/src/context/local.tsx`.
- Review panel that renders session diffs and context usage via `packages/app/src/pages/session.tsx`.
- Terminal tabs backed by PTY sessions and WebSocket streaming via `packages/app/src/components/terminal.tsx`.
- Permissions and questions flows tied to `permission.*` and `question.*` events.
- Model/provider selection, agent selection, slash commands, and command palette actions.

## Current API usage and protocols

- API client: `@opencode-ai/sdk/v2` with `createOpencodeClient()` (adds `x-opencode-directory` header when directory is provided).
- REST endpoints used by the web UI (from SDK usage in `packages/app/src/context/global-sync.tsx` and `packages/app/src/components/prompt-input.tsx`):
  - Global: `global.health()`, `global.event()` (SSE stream).
  - Project: `project.list()`, `project.current()`, `project.update()`.
  - Path/config: `path.get()`, `config.get()`, `config.update()`, `config.providers()`.
  - Providers: `provider.list()`, `provider.auth()`, `provider.oauth.authorize()`, `provider.oauth.callback()`.
  - Agents/commands: `app.agents()`, `command.list()`.
  - Sessions: `session.list()`, `session.create()`, `session.get()`, `session.update()`, `session.status()`,
    `session.messages()`, `session.message()`, `session.prompt()`, `session.promptAsync()`, `session.command()`,
    `session.shell()`, `session.abort()`, `session.diff()`, `session.todo()`, `session.summarize()`,
    `session.revert()`, `session.unrevert()`, `session.fork()`, `session.share()`, `seszsion.unshare()`.
  - Files/find: `file.list()`, `file.read()`, `find.files()`, `find.text()`, `find.symbols()`.
  - PTY: `pty.list()`, `pty.create()`, `pty.get()`, `pty.update()`, `pty.remove()`, and WebSocket `GET /pty/{id}/connect`.
  - Worktrees: `worktree.create()` and `worktree.list()` for new session worktrees.
  - MCP/LSP/VCS: `mcp.status()`, `lsp.status()`, `vcs.get()`.
  - Permissions/questions: `permission.list()`, `permission.reply()` (and deprecated `permission.respond()`),
    `question.list()`, `question.reply()`, `question.reject()`.
- Streaming protocols:
  - `global.event()` uses SSE with fetch streaming (see `packages/sdk/js/src/v2/gen/core/serverSentEvents.gen.ts`).zzZ,
  - PTY uses WebSocket to `/pty/{id}/connect?directory=...`.
- Event types processed in `packages/app/src/context/global-sync.tsx` include `session.created`, `session.updated`,2XSx
  `session.status`, `session.diff`, `todo.updated`, `message.updated`, `message.part.updated`, `message.part.removed`,
  `permission.asked`, `permission.replied`, `question.asked`, `question.replied`, `question.rejected`,z
  `vcs.branch.updated`, `lsp.updated`, `server.instance.disposed`, `project.updated`, and `global.disposed`.
- Prompt attachments:xdz
  - Image/file attachments use `data:` URLs (images) and `file://` URLs (file references) with optional
    `?start=` and `?end=` selection query params plus `source` metadata.

## Recommended RN/Expo architecture

- Add a new Expo app under `packages/mobile` (to align with the workspace `packages/*`).
- Use Expo Router with file-based routes under `packages/mobile/app` to mirror the existing `/` and `/:dir/session/:id?` routes.
  - Configure deep linking `scheme` in `app.json` and set `unstable_settings.initialRouteName` in `_layout.tsx`.
- Implement a new React platform adapter that mirrors `Platform` from `packages/app/src/context/platform.tsx`:
  - `openLink` via `expo-linking` / `Linking.openURL`.
  - `notify` via `expo-notifications`.
xxxsxzxxxssex🫠  - `storage` via `@react-native-async-storage/async-storage`.
  - `openDirectoryPickerDialog` / zzd`openFilePickerDialog` via Expo pickers.
z,zes  - `fetch` override to use RN fetch and apply auth headers consistently.
- Create a shared data layer package (recommended) to keep parity with the Solid app:e
  - Extract global sync and per-directory sync logic (currently in `packages/app/src/context/global-sync.tsx` andzezdezwzZ
    `packages/app/src/context/sync.tsx`) into ze3a framework-agnostic package (for example `packages/client-core`).
  - Provide React hooks that wrap the shared store to avoid duplicating event processing.
- Use the existing JS SDK (`@opencode-ai/sdk/v2`) for REST calls and event streaming, with RN-specific transport overrides.
- Build a native-first UI while preserving deszign tokens (font sizes, colors, spacing). Consider a new token-only package
  derived from `@opencode-ai/ui` theme valuese instead of reusing Solid components.

## Suggested tools and packages

- Core: `expo`, `expo-router`, `react-native`, `react-native-web`.
- Navigation/UI: `react-native-gesture-handler`, `react-native-reanimated`, `react-native-screens`,
  `react-native-safe-area-context`.
- Storage: `@react-native-async-storage/async-storage`.
- Attachments: `expo-document-picker`, `expo-image-picker`, `expo-file-system`.
- Notifications and links: `expo-notifications`, `expo-linking`.
- Clipboard and share: `expo-clipboard`, `expo-sharing` (optional).
- Lists and performance: `@shopify/flash-list` for long message lists and file trees.
- Terminal fallback: `react-native-webview` for embedded terminal UI if native rendering is not feasible.
- Markdown and code rendering (optional): `react-native-markdown-display`, `react-native-syntax-highlighter`.

## Feature parity plan (mobile-first adaptation)

- Server selection and health: port the server list, health check, and add flow from `DialogSelectServer`.
- Project list and project switcher: reuse `project.list()` and `project.current()` data and render a mobile-friendly list.
- Session list and session detail:
  - List recent sessions and statuses with pagination.
  - Session detail screen with message list, auto-scroll, and basic message rail navigation.
- Prompt input:
  - Support text, file references, image attachments, and slash commands.
  - Persist history and support shell mode where applicable.
- File browsing and viewer:
  - Use `file.list()` and `file.read()` for tree and file content.
  - Provide a tab or sheet UI for file previews and diff views.
- Diff review:
  - Render session diffs from `session.diff()` and allow navigation into files.
- Permissions and questions:
  - Mirror permission/question lists and replies with clear action buttons.
- Terminal:
  - Use WebSocket `/pty/{id}/connect` for interactive terminal in a WebView.
  - Provide a reduced view for smaller phones if necessary.
- Settings and model/provider management:
  - Provide provider connection flow and model selection similar to web dialogs.
- Notifications and deep links:
  - Use notifications to surface session updates and deep link into the session route.

## API extensions needed for RN while keeping compatibility

- SSE compatibility:
  - RN fetch streaming may be limited, so add a WebSocket event transport or a fallback long-poll endpoint.
  - Suggested approach: keep `GET /global/event` for web and add `GET /global/event?transport=ws` or `/global/event/ws`.
  - Update the JS SDK to choose SSE or WS based on capabilities.
- Capability discovery:
  - Add a small capability payload to `global.health()` or a new `global.capabilities()` to indicate supported transports
    and attachment formats.
- Authentication consistency:
  - Standardize on `Authorization` headers for REST and pass tokens via query or subprotocol for WebSockets.
  - Avoid relying on `window.__OPENCODE__` so mobile clients can supply credentials directly.
- File attachments:
  - Keep current `data:` URL support for small images.
  - Add an upload endpoint (for example `POST /asset`) that returns a URL or ID for larger files.
  - Allow `session.prompt` parts to reference uploaded assets while keeping `file://` and `data:` compatibility.
- Directory handling:
  - Maintain `x-opencode-directory` for all requests and allow per-request overrides for worktrees.
  - Ensure `find.files()` supports directory queries (used in `DialogSelectDirectory`).

## Milestones and deliverables

1. Scaffold
   - Create `packages/mobile` Expo app, set up Expo Router, base theming, and deep linking.
   - Implement server selection and health checks.
2. Data layer
   - Build or extract shared store for global sync and per-directory sync.
   - Integrate `@opencode-ai/sdk/v2` in RN with transport overrides.
3. Core UX
   - Session list, session detail, prompt input, and attachments.
   - Basic file browser and file viewer.
4. Advanced UX
   - Diff review panel, permissions/questions, model/provider selection, command palette.
   - Terminal support via WebSocket + WebView.
5. Polish and parity
   - Notification handling, deep links, web target testing, and performance tuning.

## Risks and open questions

- SSE streaming in RN may require server or SDK changes; confirm transport strategy early.
- Terminal UX on small screens may need a simplified view or a separate route.
- Large file and diff rendering on mobile needs virtualization and memory constraints testing.
- Decide whether to extract shared store logic into a framework-agnostic package or maintain a separate RN data layer.
- Clarify authentication strategy for mobile and remote servers (tokens vs password).

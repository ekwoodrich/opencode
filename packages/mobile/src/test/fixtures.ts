import type { FileNode, Project, Session } from "@opencode-ai/sdk/v2/client"

const base = process.env.EXPO_PUBLIC_OPENCODE_SERVER_URL ?? "http://localhost:4096"

const project: Project = {
  id: "project-1",
  worktree: "/work/project",
  vcs: "git",
  name: "Demo Project",
  time: {
    created: 1710000000000,
    updated: 1710000100000,
  },
  sandboxes: [],
}

const session: Session = {
  id: "session-1",
  slug: "session-1",
  projectID: project.id,
  directory: project.worktree,
  title: "Kickoff",
  version: "1",
  time: {
    created: 1710000200000,
    updated: 1710000300000,
  },
}

const files: FileNode[] = [
  {
    name: "README.md",
    path: "README.md",
    absolute: "/work/project/README.md",
    type: "file",
    ignored: false,
  },
  {
    name: "src",
    path: "src",
    absolute: "/work/project/src",
    type: "directory",
    ignored: false,
  },
]

const messages = [
  {
    info: {
      id: "message-1",
      sessionID: session.id,
      role: "user",
      time: {
        created: 1710000400000,
      },
      agent: "cli",
      model: {
        providerID: "opencode",
        modelID: "test-model",
      },
    },
    parts: [
      {
        id: "part-1",
        sessionID: session.id,
        messageID: "message-1",
        type: "text",
        text: "Hello from tests",
      },
    ],
  },
]

export const fixtures = {
  base,
  project,
  session,
  files,
  messages,
}

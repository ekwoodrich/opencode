import { describe, test, expect, vi } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react-native"
import SessionScreen from "../(app)/[dir]/session/[[id]]"
import { fixtures } from "@/src/test/fixtures"
import { renderWithProviders } from "@/src/test/render"
import { setParams } from "@/src/test/router"
import { server } from "@/src/test/server"
import { http, HttpResponse } from "msw"

describe("Chat Interaction", () => {
  test("sends a message and refreshes list", async () => {
    setParams({ dir: fixtures.project.worktree, id: fixtures.session.id })

    // Track if prompt was called
    let promptCalled = false
    server.use(
      http.post(`${fixtures.base}/session/${fixtures.session.id}/prompt`, async ({ request }) => {
        const body = (await request.json()) as any
        if (body.parts?.[0]?.text === "Hello Vitest") {
          promptCalled = true
        }
        return HttpResponse.json({ success: true })
      }),
    )

    renderWithProviders(<SessionScreen />)

    // Wait for initial load
    expect(await screen.findByText("User")).toBeDefined()

    // Find input and type
    const input = screen.getByPlaceholderText("Type a message...")
    fireEvent.changeText(input, "Hello Vitest")

    // Find send button and tap
    const sendButton = screen.getByText("Send")
    fireEvent.press(sendButton)

    // Verify prompt was called with correct data
    await waitFor(() => expect(promptCalled).toBe(true))

    // Input should be cleared
    expect(input.props.value).toBe("")
  })

  test("shows error when sending fails", async () => {
    setParams({ dir: fixtures.project.worktree, id: fixtures.session.id })

    server.use(
      http.post(`${fixtures.base}/session/${fixtures.session.id}/prompt`, () => {
        return HttpResponse.json({ message: "Error" }, { status: 500 })
      }),
    )

    renderWithProviders(<SessionScreen />)

    // Wait for initial load
    expect(await screen.findByText("User")).toBeDefined()

    // Type and send
    const input = screen.getByPlaceholderText("Type a message...")
    fireEvent.changeText(input, "Bad Message")
    fireEvent.press(screen.getByText("Send"))

    // Should show error text
    expect(await screen.findByText("Could not send message.")).toBeDefined()
  })
})

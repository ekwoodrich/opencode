import { describe, test, expect } from "vitest"
import { screen } from "@testing-library/react-native"
import SessionScreen from "../(app)/[dir]/session/[[id]]"
import { fixtures } from "@/src/test/fixtures"
import { renderWithProviders } from "@/src/test/render"
import { setParams } from "@/src/test/router"

describe("SessionScreen", () => {
  test("renders message preview", async () => {
    setParams({ dir: fixtures.project.worktree, id: fixtures.session.id })

    renderWithProviders(<SessionScreen />)

    expect(await screen.findByText("User")).toBeDefined()
    expect(await screen.findByText(fixtures.messages[0]?.parts[0]?.text ?? "")).toBeDefined()
  })
})

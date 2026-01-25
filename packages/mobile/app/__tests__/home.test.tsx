import { describe, test, expect } from "vitest"
import { screen } from "@testing-library/react-native"
import HomeScreen from "../(app)/index"
import { fixtures } from "@/src/test/fixtures"
import { renderWithProviders } from "@/src/test/render"
import { server } from "@/src/test/server"
import { http, HttpResponse } from "msw"

describe("HomeScreen", () => {
  test("renders project list", async () => {
    renderWithProviders(<HomeScreen />)

    expect(await screen.findByText(fixtures.project.name ?? "")).toBeDefined()
    expect(await screen.findByText(fixtures.project.worktree)).toBeDefined()
  })

  test("shows error when project list fails", async () => {
    server.use(
      http.get(`${fixtures.base}/project`, () => {
        return HttpResponse.json({ message: "error" }, { status: 500 })
      }),
    )

    renderWithProviders(<HomeScreen />)

    expect(await screen.findByText("Could not load projects.")).toBeDefined()
  })
})

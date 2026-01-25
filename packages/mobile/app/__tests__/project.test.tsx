import { screen } from "@testing-library/react-native"
import ProjectScreen from "../(app)/[dir]/index"
import { fixtures } from "@/src/test/fixtures"
import { renderWithProviders } from "@/src/test/render"
import { setParams } from "@/src/test/router"

test("renders sessions and files", async () => {
  setParams({ dir: fixtures.project.worktree })

  renderWithProviders(<ProjectScreen />)

  expect(await screen.findByText(fixtures.session.title)).toBeOnTheScreen()
  expect(await screen.findByText(fixtures.files[0]?.name ?? "")).toBeOnTheScreen()
})

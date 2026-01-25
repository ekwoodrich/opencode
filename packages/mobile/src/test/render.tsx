import { render } from "@testing-library/react-native"
import type { ReactElement } from "react"
import { PlatformProvider } from "@/src/context/platform"
import { ServerProvider } from "@/src/context/server"

export function renderWithProviders(node: ReactElement) {
  return render(
    <PlatformProvider>
      <ServerProvider>{node}</ServerProvider>
    </PlatformProvider>,
  )
}

import { beforeAll, afterAll, afterEach, vi } from "vitest"
import AsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock"
import { server } from "@/src/test/server"
import { getParams, getRouter, resetParams } from "@/src/test/router"

process.env.EXPO_PUBLIC_OPENCODE_SERVER_URL = process.env.EXPO_PUBLIC_OPENCODE_SERVER_URL ?? "http://localhost:4096"

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: AsyncStorage,
}))

// Mock expo-router
vi.mock("expo-router", () => ({
  useRouter: () => getRouter(),
  useLocalSearchParams: () => getParams(),
  Link: ({ children }: { children: React.ReactNode }) => children,
  Slot: ({ children }: { children?: React.ReactNode }) => children,
}))

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" })
})

afterEach(() => {
  server.resetHandlers()
  resetParams()
  return AsyncStorage.clear()
})

afterAll(() => {
  server.close()
})

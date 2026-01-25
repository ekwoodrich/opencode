import "@testing-library/jest-native/extend-expect"
import AsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock"
import { server } from "@/src/test/server"
import { getParams, getRouter, resetParams } from "@/src/test/router"

process.env.EXPO_PUBLIC_OPENCODE_SERVER_URL = process.env.EXPO_PUBLIC_OPENCODE_SERVER_URL ?? "http://localhost:4096"

jest.mock("@react-native-async-storage/async-storage", () => AsyncStorage)

jest.mock("expo-router", () => {
  return {
    useRouter: () => getRouter(),
    useLocalSearchParams: () => getParams(),
  }
})

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

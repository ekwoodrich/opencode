import { createContext, useContext, useMemo, type ReactNode } from "react"
import * as Linking from "expo-linking"
import AsyncStorage from "@react-native-async-storage/async-storage"

export type Platform = {
  platform: "native"
  version?: string
  openLink: (url: string) => void
  restart: () => Promise<void>
  notify: (title: string, description?: string, href?: string) => Promise<void>
  storage: typeof AsyncStorage
  fetch: typeof fetch
}

const PlatformContext = createContext<Platform | null>(null)

export function PlatformProvider(props: { children: ReactNode }) {
  const value = useMemo<Platform>(
    () => ({
      platform: "native",
      version: undefined,
      openLink: (url: string) => {
        void Linking.openURL(url)
      },
      restart: async () => {
        return
      },
      notify: async () => {
        return
      },
      storage: AsyncStorage,
      fetch,
    }),
    [],
  )

  return <PlatformContext.Provider value={value}>{props.children}</PlatformContext.Provider>
}

export function usePlatform() {
  const context = useContext(PlatformContext)
  if (context) return context
  throw new Error("usePlatform must be used within PlatformProvider")
}

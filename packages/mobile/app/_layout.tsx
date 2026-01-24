import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { Stack } from "expo-router"
import { useColorScheme } from "react-native"
import { PlatformProvider } from "@/src/context/platform"
import { ServerProvider } from "@/src/context/server"

export { ErrorBoundary } from "expo-router"

export const unstable_settings = {
  initialRouteName: "index",
}

export default function RootLayout() {
  const scheme = useColorScheme()
  const theme = scheme === "dark" ? DarkTheme : DefaultTheme

  return (
    <PlatformProvider>
      <ServerProvider>
        <ThemeProvider value={theme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(app)" />
          </Stack>
        </ThemeProvider>
      </ServerProvider>
    </PlatformProvider>
  )
}

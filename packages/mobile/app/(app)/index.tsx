import { useRouter } from "expo-router"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useServer } from "@/src/context/server"
import { serverDisplayName } from "@/src/lib/server"

export default function HomeScreen() {
  const router = useRouter()
  const server = useServer()
  const active = server.active

  if (!active) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>No server selected</Text>
          <Pressable style={styles.button} onPress={() => router.replace("/")}>
            <Text style={styles.buttonText}>Choose server</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Connected</Text>
        <Text style={styles.subtitle}>{serverDisplayName(active)}</Text>
        <Text style={styles.body}>Project list and sessions will appear here in the next phase.</Text>
        <Pressable style={styles.button} onPress={() => router.replace("/")}>
          <Text style={styles.buttonText}>Switch server</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f0f10",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#f6f4f2",
  },
  subtitle: {
    fontSize: 14,
    color: "#9c938b",
  },
  body: {
    fontSize: 14,
    color: "#b8b1aa",
    textAlign: "center",
    maxWidth: 280,
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#4a7cff",
  },
  buttonText: {
    color: "#f6f4f2",
    fontWeight: "600",
  },
})

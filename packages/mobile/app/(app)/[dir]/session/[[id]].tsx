import { useLocalSearchParams } from "expo-router"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SessionScreen() {
  const params = useLocalSearchParams<{ dir?: string | string[]; id?: string | string[] }>()
  const rawDir = params.dir
  const rawId = params.id
  const dir = Array.isArray(rawDir) ? rawDir[0] : rawDir
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  const dirValue = dir ?? "unknown"
  const idValue = id ?? "new"

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Session</Text>
        <Text style={styles.subtitle}>Project: {dirValue}</Text>
        <Text style={styles.subtitle}>Session: {idValue}</Text>
        <Text style={styles.body}>Session UI will be implemented in the next phase.</Text>
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
    gap: 10,
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
})

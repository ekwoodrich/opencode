import { useLocalSearchParams } from "expo-router"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function ProjectScreen() {
  const params = useLocalSearchParams<{ dir?: string | string[] }>()
  const raw = params.dir
  const dir = Array.isArray(raw) ? raw[0] : raw
  const value = dir ?? "unknown"

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Project</Text>
        <Text style={styles.subtitle}>{value}</Text>
        <Text style={styles.body}>Project overview will be implemented in the next phase.</Text>
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

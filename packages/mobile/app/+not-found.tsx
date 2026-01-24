import { Link, Stack } from "expo-router"
import { StyleSheet, Text, View } from "react-native"

export default function NotFoundScreen() {
  return (
    <View style={styles.safe}>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go back to the server picker</Text>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f0f10",
    justifyContent: "center",
  },
  container: {
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f6f4f2",
  },
  link: {
    paddingVertical: 10,
  },
  linkText: {
    color: "#9cb4ff",
    fontSize: 14,
  },
})

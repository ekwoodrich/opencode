import { useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View, SafeAreaView } from "react-native"
import { useServer } from "@/src/context/server"
import { serverDisplayName } from "@/src/lib/server"

type Entry = {
  url: string
  active: boolean
  healthy: boolean | undefined
  version?: string
}

export default function ServerScreen() {
  const router = useRouter()
  const server = useServer()
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const entries = useMemo<Entry[]>(
    () =>
      server.list.map((url) => ({
        url,
        active: server.active === url,
        healthy: server.status[url]?.healthy,
        version: server.status[url]?.version,
      })),
    [server.active, server.list, server.status],
  )

  const handleSelect = (url: string) => {
    if (server.status[url]?.healthy === false) return
    server.setActive(url)
    router.push("/(app)")
  }

  const handleAdd = async () => {
    const value = input.trim()
    if (!value) {
      setError("Enter a server URL.")
      return
    }
    setBusy(true)
    const result = await server.add(value)
    setBusy(false)
    if (!result.ok) {
      setError(result.error ?? "Could not connect to server.")
      return
    }
    setInput("")
    setError("")
    router.push("/(app)")
  }

  const handleRefresh = () => {
    void server.refresh()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>OpenCode</Text>
          <Text style={styles.subtitle}>Connect to an OpenCode server to continue.</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Servers</Text>
            <Pressable style={styles.link} onPress={handleRefresh}>
              <Text style={styles.linkText}>Refresh</Text>
            </Pressable>
          </View>

          {!server.ready && <ActivityIndicator style={styles.loader} />}

          <FlatList<Entry>
            data={entries}
            keyExtractor={(item) => item.url}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }: { item: Entry }) => (
              <Pressable onPress={() => handleSelect(item.url)} style={[styles.row, item.active && styles.rowActive]}>
                <View style={styles.rowInfo}>
                  <View
                    style={[
                      styles.status,
                      item.healthy === true && styles.statusOk,
                      item.healthy === false && styles.statusFail,
                    ]}
                  />
                  <Text style={styles.rowText}>{serverDisplayName(item.url)}</Text>
                  {item.version ? <Text style={styles.rowMeta}>{item.version}</Text> : null}
                </View>
                {item.active ? <Text style={styles.rowMeta}>Active</Text> : null}
              </Pressable>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a server</Text>
          <TextInput
            value={input}
            onChangeText={(value) => {
              setInput(value)
              setError("")
            }}
            placeholder="http://localhost:4096"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={[styles.button, busy && styles.buttonDisabled]} onPress={handleAdd} disabled={busy}>
            <Text style={styles.buttonText}>{busy ? "Checking..." : "Add server"}</Text>
          </Pressable>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#f6f4f2",
  },
  subtitle: {
    fontSize: 14,
    color: "#b8b1aa",
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f6f4f2",
  },
  loader: {
    paddingVertical: 12,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#1a1a1f",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowActive: {
    borderWidth: 1,
    borderColor: "#4a7cff",
  },
  rowInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowText: {
    fontSize: 14,
    color: "#f6f4f2",
  },
  rowMeta: {
    fontSize: 12,
    color: "#9c938b",
  },
  status: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5c5c5c",
  },
  statusOk: {
    backgroundColor: "#2ec27e",
  },
  statusFail: {
    backgroundColor: "#e01b24",
  },
  separator: {
    height: 10,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2e2e35",
    color: "#f6f4f2",
  },
  error: {
    color: "#ff7b7b",
    fontSize: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#4a7cff",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#f6f4f2",
    fontWeight: "600",
  },
  link: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  linkText: {
    color: "#9cb4ff",
    fontSize: 12,
  },
})

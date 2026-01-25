import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native"
import { createOpencodeClient, type Project } from "@opencode-ai/sdk/v2/client"
import { usePlatform } from "@/src/context/platform"
import { useServer } from "@/src/context/server"
import { serverDisplayName } from "@/src/lib/server"

type Entry = Project

export default function HomeScreen() {
  const router = useRouter()
  const platform = usePlatform()
  const server = useServer()
  const active = server.active
  const [items, setItems] = useState<Entry[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [tick, setTick] = useState(0)

  const client = useMemo(() => {
    if (!active) return
    return createOpencodeClient({ baseUrl: active, fetch: platform.fetch })
  }, [active, platform.fetch])

  useEffect(() => {
    if (!client) {
      setItems([])
      setBusy(false)
      setError("")
      return
    }
    const live = { value: true }
    setBusy(true)
    setError("")
    client.project
      .list()
      .then((result) => {
        if (!live.value) return
        setItems(result.data ?? [])
      })
      .catch(() => {
        if (!live.value) return
        setError("Could not load projects.")
      })
      .finally(() => {
        if (!live.value) return
        setBusy(false)
      })
    return () => {
      live.value = false
    }
  }, [client, tick])

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

  const handleSwitchServer = () => {
    router.back()
  }

  const handleRefresh = () => {
    setTick((value) => value + 1)
  }

  const empty = !busy && !error && items.length === 0

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Connected</Text>
          <Text style={styles.subtitle}>{serverDisplayName(active)}</Text>
          <Pressable style={styles.button} onPress={handleSwitchServer}>
            <Text style={styles.buttonText}>Switch server</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <Pressable style={styles.link} onPress={handleRefresh}>
              <Text style={styles.linkText}>Refresh</Text>
            </Pressable>
          </View>

          {busy ? <ActivityIndicator style={styles.loader} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              empty ? (
                <Text style={styles.empty}>No projects yet. Open a project in OpenCode to see it here.</Text>
              ) : null
            }
            renderItem={(info: { item: Entry }) => {
              const item = info.item
              const work = item.worktree
              const parts = work.split("/")
              const tail = parts[parts.length - 1] ?? work
              const name = item.name?.trim() ?? ""
              const title = name ? name : tail
              return (
                <Pressable
                  style={styles.row}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/[dir]",
                      params: { dir: work },
                    })
                  }
                >
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle}>{title}</Text>
                    <Text style={styles.rowMeta}>{work}</Text>
                  </View>
                  <Text style={styles.rowHint}>Open</Text>
                </Pressable>
              )
            }}
          />
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
    padding: 24,
    gap: 24,
  },
  header: {
    gap: 8,
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
  rowInfo: {
    gap: 4,
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    color: "#f6f4f2",
  },
  rowMeta: {
    fontSize: 12,
    color: "#9c938b",
  },
  rowHint: {
    fontSize: 12,
    color: "#9cb4ff",
  },
  separator: {
    height: 10,
  },
  empty: {
    color: "#b8b1aa",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
  },
  error: {
    color: "#ff7b7b",
    fontSize: 12,
  },
  button: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#4a7cff",
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

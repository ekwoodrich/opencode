import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native"
import { createOpencodeClient, type Message, type Part, type Session } from "@opencode-ai/sdk/v2/client"
import { usePlatform } from "@/src/context/platform"
import { useServer } from "@/src/context/server"

type Entry = {
  info: Message
  parts: Part[]
}

export default function SessionScreen() {
  const router = useRouter()
  const platform = usePlatform()
  const server = useServer()
  const params = useLocalSearchParams<{ dir?: string | string[]; id?: string | string[]; "[id]"?: string | string[] }>()
  const rawDir = params.dir
  const rawId = params.id ?? params["[id]"]
  const dir = Array.isArray(rawDir) ? rawDir[0] : rawDir
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  const [info, setInfo] = useState<Session | null>(null)
  const [items, setItems] = useState<Entry[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [tick, setTick] = useState(0)

  const client = useMemo(() => {
    if (!server.active) return
    if (!dir) return
    return createOpencodeClient({ baseUrl: server.active, fetch: platform.fetch, directory: dir })
  }, [dir, platform.fetch, server.active])

  useEffect(() => {
    if (!client || !dir || !id) {
      setInfo(null)
      setItems([])
      setBusy(false)
      setError("")
      return
    }
    const live = { value: true }
    setBusy(true)
    setError("")
    Promise.all([
      client.session.get({ sessionID: id, directory: dir }),
      client.session.messages({ sessionID: id, directory: dir, limit: 50 }),
    ])
      .then((result) => {
        if (!live.value) return
        setInfo(result[0].data ?? null)
        setItems(result[1].data ?? [])
      })
      .catch(() => {
        if (!live.value) return
        setError("Could not load session.")
      })
      .finally(() => {
        if (!live.value) return
        setBusy(false)
      })
    return () => {
      live.value = false
    }
  }, [client, dir, id, tick])

  if (!server.active) {
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

  if (!dir) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>Project not found</Text>
          <Pressable style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  if (!id) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>Session not selected</Text>
          <Pressable style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const handleRefresh = () => {
    setTick((value) => value + 1)
  }

  const title = info?.title ?? "Session"
  const empty = !busy && !error && items.length === 0

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.link} onPress={() => router.back()}>
            <Text style={styles.linkText}>Back</Text>
          </Pressable>
          <Pressable style={styles.link} onPress={handleRefresh}>
            <Text style={styles.linkText}>Refresh</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{dir}</Text>
        {busy ? <ActivityIndicator style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FlatList
          data={items}
          keyExtractor={(item) => item.info.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={empty ? <Text style={styles.empty}>No messages yet.</Text> : null}
          renderItem={(entry: { item: Entry }) => {
            const item = entry.item
            const role = item.info.role === "assistant" ? "Assistant" : "User"
            const part = item.parts.find((entry) => entry.type === "text")
            const text = part && "text" in part ? part.text : ""
            const line = text ? text.split("\n")[0] : "No text content."
            return (
              <View style={styles.row}>
                <View style={styles.rowHead}>
                  <Text style={styles.rowRole}>{role}</Text>
                  <Text style={styles.rowMeta}>{new Date(item.info.time.created).toLocaleString()}</Text>
                </View>
                <Text style={styles.rowText}>{line}</Text>
              </View>
            )
          }}
        />
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
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#f6f4f2",
  },
  subtitle: {
    fontSize: 13,
    color: "#9c938b",
  },
  loader: {
    paddingVertical: 12,
  },
  list: {
    paddingBottom: 24,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#1a1a1f",
    gap: 6,
  },
  rowHead: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowRole: {
    fontSize: 12,
    color: "#9cb4ff",
    textTransform: "uppercase",
  },
  rowMeta: {
    fontSize: 11,
    color: "#9c938b",
  },
  rowText: {
    fontSize: 13,
    color: "#f6f4f2",
  },
  separator: {
    height: 10,
  },
  empty: {
    color: "#b8b1aa",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 8,
  },
  error: {
    color: "#ff7b7b",
    fontSize: 12,
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
  link: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  linkText: {
    color: "#9cb4ff",
    fontSize: 12,
  },
})

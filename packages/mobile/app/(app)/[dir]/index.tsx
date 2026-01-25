import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native"
import { createOpencodeClient, type FileNode, type Project, type Session } from "@opencode-ai/sdk/v2/client"
import { usePlatform } from "@/src/context/platform"
import { useServer } from "@/src/context/server"

type Entry = Session

type Item = FileNode

export default function ProjectScreen() {
  const router = useRouter()
  const platform = usePlatform()
  const server = useServer()
  const params = useLocalSearchParams<{ dir?: string | string[] }>()
  const raw = params.dir
  const dir = Array.isArray(raw) ? raw[0] : raw
  const [project, setProject] = useState<Project | null>(null)
  const [sessions, setSessions] = useState<Entry[]>([])
  const [files, setFiles] = useState<Item[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [tick, setTick] = useState(0)

  const client = useMemo(() => {
    if (!server.active) return
    if (!dir) return
    return createOpencodeClient({ baseUrl: server.active, fetch: platform.fetch, directory: dir })
  }, [dir, platform.fetch, server.active])

  useEffect(() => {
    if (!client || !dir) {
      setProject(null)
      setSessions([])
      setFiles([])
      setBusy(false)
      setError("")
      return
    }
    const live = { value: true }
    setBusy(true)
    setError("")
    Promise.all([
      client.project.current(),
      client.session.list({ directory: dir, roots: true }),
      client.file.list({ path: "" }),
    ])
      .then((result) => {
        if (!live.value) return
        setProject(result[0].data ?? null)
        setSessions(result[1].data ?? [])
        setFiles(result[2].data ?? [])
      })
      .catch(() => {
        if (!live.value) return
        setError("Could not load project details.")
      })
      .finally(() => {
        if (!live.value) return
        setBusy(false)
      })
    return () => {
      live.value = false
    }
  }, [client, dir, tick])

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

  const handleRefresh = () => {
    setTick((value) => value + 1)
  }

  const handleCreateSession = async () => {
    if (!client || !dir || busy) return
    setBusy(true)
    setError("")
    try {
      const result = await client.session.create({ directory: dir })
      if (result.data?.id) {
        router.push({
          pathname: "/(app)/[dir]/session/[[id]]",
          params: { dir, "[id]": result.data.id },
        })
      } else {
        setError("Could not create session.")
      }
    } catch (err) {
      console.error(err)
      setError("Could not create session.")
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteSession = async (sessionID: string) => {
    if (!client || !dir) return
    try {
      await client.session.delete({ sessionID, directory: dir })
      handleRefresh()
    } catch (err) {
      console.error(err)
      setError("Could not delete session.")
    }
  }

  const handleBack = () => {
    router.back()
  }

  const name = project?.name?.trim() ?? ""
  const work = project?.worktree ?? dir
  const pieces = work.split("/")
  const tail = pieces[pieces.length - 1] ?? work
  const title = name ? name : tail
  const emptySessions = !busy && !error && sessions.length === 0
  const emptyFiles = !busy && !error && files.length === 0

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.link} onPress={handleBack}>
            <Text style={styles.linkText}>Back</Text>
          </Pressable>
          <Pressable style={styles.link} onPress={handleRefresh}>
            <Text style={styles.linkText}>Refresh</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{work}</Text>
        {busy ? <ActivityIndicator style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sessions</Text>
            <Pressable style={styles.addButton} onPress={handleCreateSession} disabled={busy}>
              <Text style={styles.addButtonText}>+ New</Text>
            </Pressable>
          </View>
          {sessions.map((item) => (
            <View key={item.id} style={styles.row}>
              <Pressable
                style={styles.rowInfo}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/[dir]/session/[[id]]",
                    params: { dir, "[id]": item.id },
                  })
                }
              >
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowMeta}>Updated {new Date(item.time.updated).toLocaleString()}</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={() => handleDeleteSession(item.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          ))}
          {emptySessions ? <Text style={styles.empty}>No sessions yet.</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Files</Text>
          {files.map((item) => (
            <View key={item.path} style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowMeta}>{item.path}</Text>
              </View>
              <Text style={styles.rowHint}>{item.type}</Text>
            </View>
          ))}
          {emptyFiles ? <Text style={styles.empty}>No files found.</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f0f10",
  },
  container: {
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
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
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f6f4f2",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#4a7cff",
  },
  addButtonText: {
    color: "#f6f4f2",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#2a2a2f",
  },
  deleteButtonText: {
    color: "#ff7b7b",
    fontSize: 12,
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

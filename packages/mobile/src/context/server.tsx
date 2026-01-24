import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { createOpencodeClient } from "@opencode-ai/sdk/v2/client"
import { normalizeServerUrl } from "@/src/lib/server"
import { usePlatform } from "@/src/context/platform"

type ServerStatus = { healthy: boolean; version?: string }

type AddResult = { ok: boolean; error?: string }

type ServerContextValue = {
  list: string[]
  active: string | null
  status: Record<string, ServerStatus | undefined>
  ready: boolean
  add: (input: string) => Promise<AddResult>
  remove: (url: string) => void
  setActive: (url: string) => void
  refresh: () => Promise<void>
}

const ServerContext = createContext<ServerContextValue | null>(null)

const LIST_KEY = "opencode.server.list"
const ACTIVE_KEY = "opencode.server.active"

function parseList(raw: string | null) {
  if (!raw) return [] as string[]
  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed)) return [] as string[]
  return (parsed as unknown[]).filter((item: unknown): item is string => typeof item === "string")
}

function dedupe(items: string[]) {
  return Array.from(new Set(items))
}

async function checkHealth(url: string, fetcher: typeof fetch) {
  const sdk = createOpencodeClient({ baseUrl: url, fetch: fetcher })
  return sdk.global
    .health()
    .then((x) => ({ healthy: x.data?.healthy === true, version: x.data?.version }))
    .catch(() => ({ healthy: false }))
}

export function ServerProvider(props: { children: ReactNode }) {
  const platform = usePlatform()
  const [list, setList] = useState<string[]>([])
  const [active, setActiveState] = useState<string | null>(null)
  const [status, setStatus] = useState<Record<string, ServerStatus | undefined>>({})
  const [ready, setReady] = useState(false)

  const defaultUrl = useMemo(() => normalizeServerUrl(process.env.EXPO_PUBLIC_OPENCODE_SERVER_URL ?? ""), [])

  useEffect(() => {
    const load = async () => {
      const storedList = parseList(await platform.storage.getItem(LIST_KEY))
      const storedActive = await platform.storage.getItem(ACTIVE_KEY)
      const defaults = defaultUrl ? [defaultUrl] : []
      const nextList = dedupe([...defaults, ...storedList])
      const nextActive = storedActive && nextList.includes(storedActive) ? storedActive : (nextList[0] ?? null)
      setList(nextList)
      setActiveState(nextActive)
      setReady(true)
    }
    void load()
  }, [defaultUrl, platform.storage])

  useEffect(() => {
    if (!ready) return
    void platform.storage.setItem(LIST_KEY, JSON.stringify(list))
  }, [list, platform.storage, ready])

  useEffect(() => {
    if (!ready) return
    if (!active) {
      void platform.storage.removeItem(ACTIVE_KEY)
      return
    }
    void platform.storage.setItem(ACTIVE_KEY, active)
  }, [active, platform.storage, ready])

  const refresh = useCallback(async () => {
    const entries = await Promise.all(list.map(async (url) => [url, await checkHealth(url, platform.fetch)] as const))
    setStatus(Object.fromEntries(entries))
  }, [list, platform.fetch])

  useEffect(() => {
    if (!ready) return
    void refresh()
  }, [ready, refresh])

  const setActive = useCallback((url: string) => {
    setActiveState(url)
  }, [])

  const remove = useCallback((url: string) => {
    setList((current) => current.filter((item) => item !== url))
    setStatus((current) => {
      const next = { ...current }
      delete next[url]
      return next
    })
    setActiveState((current) => (current === url ? null : current))
  }, [])

  const add = useCallback(
    async (input: string) => {
      const url = normalizeServerUrl(input)
      if (!url) return { ok: false, error: "Enter a valid server URL." }
      const result = await checkHealth(url, platform.fetch)
      if (!result.healthy) return { ok: false, error: "Could not connect to server." }
      setList((current) => dedupe([...current, url]))
      setActiveState(url)
      setStatus((current) => ({ ...current, [url]: result }))
      return { ok: true }
    },
    [platform.fetch],
  )

  const value = useMemo<ServerContextValue>(
    () => ({
      list,
      active,
      status,
      ready,
      add,
      remove,
      setActive,
      refresh,
    }),
    [active, add, list, ready, refresh, remove, setActive, status],
  )

  return <ServerContext.Provider value={value}>{props.children}</ServerContext.Provider>
}

export function useServer() {
  const context = useContext(ServerContext)
  if (context) return context
  throw new Error("useServer must be used within ServerProvider")
}

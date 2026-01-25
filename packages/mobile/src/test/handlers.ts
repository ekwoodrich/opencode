import { http, HttpResponse } from "msw"
import { fixtures } from "@/src/test/fixtures"

export const handlers = [
  http.get(`${fixtures.base}/global/health`, () => {
    return HttpResponse.json({ healthy: true, version: "test" })
  }),
  http.get(`${fixtures.base}/project`, () => {
    return HttpResponse.json([fixtures.project])
  }),
  http.get(`${fixtures.base}/project/current`, () => {
    return HttpResponse.json(fixtures.project)
  }),
  http.get(`${fixtures.base}/session`, () => {
    return HttpResponse.json([fixtures.session])
  }),
  http.get(`${fixtures.base}/file`, () => {
    return HttpResponse.json(fixtures.files)
  }),
  http.get(`${fixtures.base}/session/:sessionID`, () => {
    return HttpResponse.json(fixtures.session)
  }),
  http.get(`${fixtures.base}/session/:sessionID/message`, () => {
    return HttpResponse.json(fixtures.messages)
  }),
  http.post(`${fixtures.base}/session/:sessionID/prompt`, () => {
    return HttpResponse.json({ success: true })
  }),
]

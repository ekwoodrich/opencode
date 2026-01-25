import { setupServer } from "msw/node"
import { handlers } from "@/src/test/handlers"

export const server = setupServer(...handlers)

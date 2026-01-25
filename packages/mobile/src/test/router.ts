type Params = Record<string, string | string[] | undefined>

type Router = {
  push: (path: string) => void
  back: () => void
  replace: (path: string) => void
}

const state: { params: Params; router: Router } = {
  params: {},
  router: {
    push: () => {},
    back: () => {},
    replace: () => {},
  },
}

export function setParams(next: Params) {
  state.params = next
}

export function resetParams() {
  state.params = {}
}

export function getParams() {
  return state.params
}

export function getRouter() {
  return state.router
}

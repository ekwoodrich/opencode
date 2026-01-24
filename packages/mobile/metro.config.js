const { getDefaultConfig } = require("expo/metro-config")
const fs = require("fs")
const path = require("path")
const { resolve } = require("metro-resolver")

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, "../..")

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot, ...config.watchFolders]
config.resolver.nodeModulesPaths = [path.join(projectRoot, "node_modules"), path.join(workspaceRoot, "node_modules")]

const resolveJsExtension = (context, moduleName, platform) => {
  const isRelative = moduleName.startsWith(".")
  const isJs = moduleName.endsWith(".js")
  if (!isRelative || !isJs) return resolve(context, moduleName, platform)

  const without = moduleName.slice(0, -3)
  const base = path.resolve(path.dirname(context.originModulePath), without)
  const sourceExts = context.sourceExts ?? config.resolver.sourceExts ?? []
  const hasMatch = sourceExts.some((ext) => fs.existsSync(`${base}.${ext}`))
  if (!hasMatch) return resolve(context, moduleName, platform)

  return resolve(context, without, platform)
}

config.resolver.resolveRequest = resolveJsExtension

module.exports = config

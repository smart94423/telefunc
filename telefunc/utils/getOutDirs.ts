import type { UserConfig, ResolvedConfig } from 'vite'
import { viteIsSSR } from './viteIsSSR'
import { assert } from './assert'
import { assertPosixPath, toPosixPath } from './filesystemPathHandling'
import path from 'path'

export { getOutDirs }
export { determineOutDir }

type OutDirs = {
  /** Absolute path to `outDir` */
  outDirRoot: string
  /** Absolute path to `${outDir}/client` */
  outDirClient: string
  /** Absolute path to `${outDir}/server` */
  outDirServer: string
}

function getOutDirs(config: ResolvedConfig): OutDirs {
  const outDir = config.build.outDir
  assertPosixPath(outDir)
  assertIsNotOutDirRoot(outDir)
  assertConfig(config)
  assert('/client'.length === '/server'.length)
  let outDirRoot = outDir.slice(0, -1 * '/client'.length)
  return getAllOutDirs(outDirRoot, config.root)
}

/** Appends `client/` or `server/` to `config.build.outDir` */
function determineOutDir(config: UserConfig): string {
  const outDirRoot = toPosixPath(config.build?.outDir || 'dist')
  assertPosixPath(outDirRoot)
  // When using Telefunc + vite-plugin-ssr then `config.build.outDir` may already be set
  if (!isOutDirRoot(outDirRoot)) {
    assertConfig(config)
    return outDirRoot
  }
  const { outDirClient, outDirServer } = declineOutDirs(outDirRoot)
  if (viteIsSSR(config)) {
    return outDirServer
  } else {
    return outDirClient
  }
}

function getAllOutDirs(outDirRoot: string, root: string) {
  if (!outDirIsAbsolutePath(outDirRoot)) {
    assertPosixPath(outDirRoot)
    assertPosixPath(root)
    outDirRoot = path.posix.join(root, outDirRoot)
  }

  let { outDirClient, outDirServer } = declineOutDirs(outDirRoot)
  outDirRoot = outDirRoot + '/'
  outDirClient = outDirClient + '/'
  outDirServer = outDirServer + '/'

  assertNormalization(outDirRoot)
  assertNormalization(outDirClient)
  assertNormalization(outDirServer)

  return { outDirRoot, outDirClient, outDirServer }
}

function assertNormalization(outDirAny: string) {
  assertPosixPath(outDirAny)
  assert(outDirIsAbsolutePath(outDirAny))
  assert(outDirAny.endsWith('/'))
  assert(!outDirAny.endsWith('//'))
}

function declineOutDirs(outDirRoot: string) {
  assertIsOutDirRoot(outDirRoot)
  assertPosixPath(outDirRoot)
  const outDirClient = path.posix.join(outDirRoot, 'client')
  const outDirServer = path.posix.join(outDirRoot, 'server')
  assertIsNotOutDirRoot(outDirClient)
  assertIsNotOutDirRoot(outDirServer)
  return { outDirClient, outDirServer }
}

function assertIsOutDirRoot(outDir: string) {
  assert(isOutDirRoot(outDir))
}
function isOutDirRoot(outDir: string) {
  const p = outDir.split('/').filter(Boolean)
  const lastDir = p[p.length - 1]
  return lastDir !== 'client' && lastDir !== 'server'
}
function assertIsNotOutDirRoot(outDir: string) {
  assert(outDir.endsWith('/client') || outDir.endsWith('/server'))
}

function assertConfig(config: UserConfig | ResolvedConfig) {
  const outDir = config.build?.outDir
  assert(outDir)
  assertIsNotOutDirRoot(outDir)
  if (viteIsSSR(config)) {
    assert(outDir.endsWith('/server'))
  } else {
    assert(outDir.endsWith('/client'))
  }
}

function outDirIsAbsolutePath(outDir: string) {
  // There doesn't seem to be a better alternative to determine whether `outDir` is an aboslute path
  //  - Very unlikely that `outDir`'s first dir macthes the filesystem's first dir
  return getFirstDir(outDir) === getFirstDir(process.cwd())
}
function getFirstDir(p: string) {
  const firstDir = p.split(/\/|\\/).filter(Boolean)[0]
  return firstDir
}

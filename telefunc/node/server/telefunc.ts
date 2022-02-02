export { telefunc }

import { runTelefunc } from './runTelefunc'
import { assert, assertUsage, hasProp, isObject, objectAssign } from '../utils'
import { telefuncConfig } from './telefuncConfig'

/**
 * Get the HTTP response of a telefunction call.
 * @param httpRequest.url HTTP request URL
 * @param httpRequest.method HTTP request method
 * @param httpRequest.body HTTP request body
 * @returns HTTP response
 */
async function telefunc(httpRequest: { url: string; body: string; method: string }) {
  assertHttpRequest(httpRequest, arguments.length)
  const runContext = {}
  objectAssign(runContext, { httpRequest })
  objectAssign(runContext, telefuncConfig)
  const httpResponse = await runTelefunc(runContext)
  assert(httpResponse)
  return httpResponse
}

function assertHttpRequest(httpRequest: unknown, numberOfArguments: number) {
  assertUsage(httpRequest, '`telefunc(httpRequest)`: argument `httpRequest` is missing.')
  assertUsage(numberOfArguments === 1, '`telefunc()`: all arguments should be passed as a single argument object.')
  assertUsage(isObject(httpRequest), '`telefunc(httpRequest)`: argument `httpRequest` should be an object.')
  assertUsage(httpRequest, '`telefunc(httpRequest)`: argument `httpRequest` is missing.')
  assertUsage(hasProp(httpRequest, 'url'), '`telefunc({ url })`: argument `url` is missing.')
  assertUsage(hasProp(httpRequest, 'url', 'string'), '`telefunc({ url })`: argument `url` should be a string.')
  assertUsage(hasProp(httpRequest, 'method'), '`telefunc({ method })`: argument `method` is missing.')
  assertUsage(hasProp(httpRequest, 'method', 'string'), '`telefunc({ method })`: argument `method` should be a string.')
  assertUsage(hasProp(httpRequest, 'body'), '`telefunc({ body })`: argument `body` is missing.')
  // We further assert the `httpRequest` in `./runTelefunc/parseHttpRequest.ts`
}

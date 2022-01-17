export { makeHttpRequest }
export type { TelefunctionError }

import { parse } from '@brillout/json-s'
import { assert, assertUsage, isObject, objectAssign } from '../utils'

type TelefunctionError = Error & {
  isConnectionError: boolean
  isTelefunctionError: boolean
  isAbort: boolean
  value: unknown
}

async function makeHttpRequest(callContext: {
  telefuncUrl: string
  httpRequestBody: string
  telefunctionName: string
}): Promise<{ telefunctionReturn: unknown } | { telefunctionError: TelefunctionError }> {
  const method = 'POST'

  let response: Response
  try {
    response = await fetch(callContext.telefuncUrl, {
      method,
      body: callContext.httpRequestBody,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch (_) {
    const telefunctionError = new Error('No Server Connection')
    objectAssign(telefunctionError, { ...errDefaults, isConnectionError: true as const })
    return { telefunctionError }
  }

  const statusCode = response.status

  assertUsage(
    statusCode !== 404,
    installErr({
      reason: 'a 404 HTTP response',
      method,
      isNotInstalled: true,
      callContext,
    }),
  )

  if (statusCode === 500) {
    const responseBody = await response.text()
    assertUsage(
      responseBody === 'Internal Telefunction Error',
      installErr({
        reason: 'an HTTP response body that Telefunc never generates',
        method,
        callContext,
      }),
    )
    const telefunctionError = new Error(
      `The telefunction \`${callContext.telefunctionName}\` threw an error, see server logs.`,
    )
    objectAssign(telefunctionError, { ...errDefaults, isTelefunctionError: true as const })
    return { telefunctionError }
  }

  if (statusCode === 200 || statusCode === 403) {
    const responseBody = await response.text()
    const responseValue: Record<string, unknown> = parse(responseBody)
    assertUsage(
      isObject(responseValue) && 'ret' in responseValue,
      installErr({
        reason: 'an HTTP response body that Telefunc never generates',
        method,
        callContext,
      }),
    )
    if (statusCode === 200) {
      assert(!('abort' in responseValue))
      const telefunctionReturn = responseValue.ret
      return { telefunctionReturn }
    } else {
      assert('abort' in responseValue)
      const value = responseValue.ret
      const telefunctionError = new Error(
        `The telefunction \`${callContext.telefunctionName}\` threw a \`Abort(value)\`. The abort \`value\` is available at \`catch(err){ if (err.isAbort) console.log(err.value) }\`.`,
      )
      objectAssign(telefunctionError, { ...errDefaults, isAbort: true as const, value })
      return { telefunctionError }
    }
  }

  assert(![200, 404, 400, 403, 500].includes(statusCode))
  assertUsage(
    false,
    installErr({
      reason: `a status code \`${statusCode}\` which Telefunc does not return`,
      method,
      callContext,
    }),
  )
}

const errDefaults = {
  isConnectionError: false,
  isTelefunctionError: false,
  isAbort: false,
  // @ts-ignore
  value: undefined,
}

function installErr({
  reason,
  callContext,
  method,
  isNotInstalled,
}: {
  reason?: string
  isNotInstalled?: true
  method: 'GET' | 'POST'
  callContext: { telefuncUrl: string }
}) {
  let msg = [`Telefunc doesn't seem to be `]
  if (!isNotInstalled) {
    msg.push('(properly) ')
  }
  msg.push('installed on your server')
  if (reason) {
    msg.push(...[`: the HTTP ${method} request made to \`${callContext.telefuncUrl}\` returned `, reason])
  }
  msg.push('. ')
  msg.push(
    `Make sure to reply all HTTP requests made to \`${callContext.telefuncUrl}\` with the \`telefunc()\` server middleware, for both \`GET\` and \`POST\` requests. See https://telefunc.com/install`,
  )
  return msg.join('')
}

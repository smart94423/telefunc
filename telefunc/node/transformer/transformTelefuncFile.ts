export { transformTelefuncFile }

import { posix } from 'path'
import { assert } from '../utils'
import { assertPosixPath } from '../utils/assertPosixPath'
import { getCode } from './getCode'
import { getExportNames } from './getExportNames'

async function transformTelefuncFile(src: string, id: string, root: string) {
  assertPosixPath(id)
  assertPosixPath(root)

  const telefuncFilePath = '/' + posix.relative(root, id)
  assert(!telefuncFilePath.startsWith('/.'))
  assertPosixPath(telefuncFilePath)

  const exportNames = await getExportNames(src)

  return {
    code: getCode(exportNames, telefuncFilePath),
    map: null,
  }
}



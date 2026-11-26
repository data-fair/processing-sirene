import type { PrepareFunction } from '@data-fair/lib-common-types/processings.js'
import type { ProcessingConfig } from '#types/processingConfig/index.ts'

/**
 * When the configuration is saved, the INSEE API key is moved to the secrets store.
 * - a new value is stored in the secrets and replaced with '********' in the config
 * - an empty value removes it from the secrets
 */
const prepare: PrepareFunction<ProcessingConfig> = async ({ processingConfig, secrets }) => {
  const apiSireneAccessToken = processingConfig.apiSireneAccessToken

  if (apiSireneAccessToken && apiSireneAccessToken !== '********') {
    secrets.apiSireneAccessToken = apiSireneAccessToken
    processingConfig.apiSireneAccessToken = '********'
  } else if (secrets.apiSireneAccessToken && apiSireneAccessToken === '') {
    delete secrets.apiSireneAccessToken
  }

  return { processingConfig, secrets }
}

export default prepare

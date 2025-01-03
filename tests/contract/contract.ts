import { APP_DEPLOY_NOTE_DAPP, AppDeployMetadata, OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { AppManager } from '@algorandfoundation/algokit-utils/types/app-manager'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { TransactionComposer } from '@algorandfoundation/algokit-utils/types/composer'
import { SendTransactionFrom } from '@algorandfoundation/algokit-utils/types/transaction'
import { readFile } from 'fs/promises'
import path from 'path'

export const getTestingAppContract = async () => {
  const appSpecFile = await readFile(path.join(__dirname, 'application.json'), 'utf-8')
  const appSpec = JSON.parse(appSpecFile) as AppSpec

  return {
    appSpec,
    approvalProgram: Buffer.from(appSpec.source.approval, 'base64').toString('utf-8'),
    clearStateProgram: Buffer.from(appSpec.source.clear, 'base64').toString('utf-8'),
    stateSchema: {
      globalByteSlices: appSpec.state.global.num_byte_slices,
      globalInts: appSpec.state.global.num_uints,
      localByteSlices: appSpec.state.local.num_byte_slices,
      localInts: appSpec.state.local.num_byte_slices,
    },
  }
}

export const getTestingAppCreateParams = async (from: SendTransactionFrom, metadata: AppDeployMetadata) => {
  const contract = await getTestingAppContract()
  return {
    from: from,
    approvalProgram: AppManager.replaceTealTemplateDeployTimeControlParams(contract.approvalProgram, metadata).replace('TMPL_VALUE', '1'),
    clearStateProgram: contract.clearStateProgram,
    schema: contract.stateSchema,
    note: TransactionComposer.arc2Note({
      dAppName: APP_DEPLOY_NOTE_DAPP,
      data: metadata,
      format: 'j',
    }),
  }
}

export const getTestingAppDeployParams = async (deployment: {
  from: SendTransactionFrom
  metadata: AppDeployMetadata
  codeInjectionValue?: number
  onSchemaBreak?: 'replace' | 'fail' | 'append' | OnSchemaBreak
  onUpdate?: 'update' | 'replace' | 'fail' | 'append' | OnUpdate
  breakSchema?: boolean
}) => {
  const contract = await getTestingAppContract()
  return {
    approvalProgram: contract.approvalProgram,
    clearStateProgram: contract.clearStateProgram,
    from: deployment.from,
    metadata: deployment.metadata,
    schema: deployment.breakSchema
      ? {
          ...contract.stateSchema,
          globalByteSlices: contract.stateSchema.globalByteSlices + 1,
        }
      : contract.stateSchema,
    deployTimeParams: {
      VALUE: deployment.codeInjectionValue ?? 1,
    },
    onSchemaBreak: deployment.onSchemaBreak,
    onUpdate: deployment.onUpdate,
  }
}

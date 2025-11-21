import algosdk from 'algosdk'

// Algorand client configuration
const algodUrl = process.env.ALGOD_URL!
const algodToken = process.env.ALGOD_TOKEN || ''
const algodPort = process.env.ALGOD_PORT || ''
const indexerUrl = process.env.ALGORAND_INDEXER_URL!

// Initialize Algorand clients
export const algodClient = new algosdk.Algodv2(algodToken, algodUrl, algodPort)
export const indexerClient = new algosdk.Indexer('', indexerUrl, '')

// Utility functions
export async function getSuggestedParams() {
  try {
    return await algodClient.getTransactionParams().do()
  } catch (error) {
    console.error('Error getting suggested params:', error)
    throw new Error('Failed to get Algorand transaction parameters')
  }
}

export async function getAssetInfo(assetId: number) {
  try {
    return await algodClient.getAssetByID(assetId).do()
  } catch (error) {
    console.error('Error getting asset info:', error)
    throw new Error(`Failed to get asset info for ASA ID: ${assetId}`)
  }
}

export async function getAccountAssets(walletAddress: string) {
  try {
    const accountInfo = await indexerClient
      .lookupAccountByID(walletAddress)
      .do()
    
    return accountInfo.account.assets || []
  } catch (error) {
    console.error('Error getting account assets:', error)
    throw new Error(`Failed to get assets for wallet: ${walletAddress}`)
  }
}

export async function checkAssetOwnership(walletAddress: string, assetId: number): Promise<boolean> {
  try {
    const assets = await getAccountAssets(walletAddress)
    const asset = assets.find((a: any) => a['asset-id'] === assetId)
    return asset && asset.amount > 0
  } catch (error) {
    console.error('Error checking asset ownership:', error)
    return false
  }
}

export function createPaymentTransaction(
  from: string,
  to: string,
  amount: number,
  suggestedParams: algosdk.SuggestedParams,
  note?: string
) {
  return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from,
    to,
    amount,
    suggestedParams,
    note: note ? new TextEncoder().encode(note) : undefined
  })
}

export function createAssetTransferTransaction(
  from: string,
  to: string,
  assetIndex: number,
  amount: number,
  suggestedParams: algosdk.SuggestedParams,
  note?: string
) {
  return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from,
    to,
    assetIndex,
    amount,
    suggestedParams,
    note: note ? new TextEncoder().encode(note) : undefined
  })
}

export function createAssetOptInTransaction(
  from: string,
  assetIndex: number,
  suggestedParams: algosdk.SuggestedParams
) {
  return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from,
    to: from, // Opt-in transaction sends to self
    assetIndex,
    amount: 0,
    suggestedParams
  })
}

export async function submitSignedTransaction(signedTxn: Uint8Array) {
  try {
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do()
    await algosdk.waitForConfirmation(algodClient, txId, 4)
    return txId
  } catch (error) {
    console.error('Error submitting transaction:', error)
    throw new Error('Failed to submit transaction to Algorand network')
  }
}

export function groupTransactions(transactions: algosdk.Transaction[]) {
  return algosdk.assignGroupID(transactions)
}

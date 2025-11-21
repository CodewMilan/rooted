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

    const assets = accountInfo.account.assets || []
    
    // Log raw asset structure for debugging (convert BigInt to string to avoid serialization issues)
    if (assets.length > 0) {
      const firstAsset = assets[0]
      const loggableAsset = {
        assetId: firstAsset.assetId?.toString() || firstAsset['asset-id']?.toString(),
        amount: firstAsset.amount?.toString(),
        'is-frozen': firstAsset['is-frozen'] || firstAsset.isFrozen,
        deleted: firstAsset.deleted
      }
      console.log('Raw asset structure from indexer:', loggableAsset)
    }
    
    // The indexer returns assets with 'assetId' (camelCase) not 'asset-id' (kebab-case)
    // Normalize to use 'asset-id' for consistency and convert BigInt to number
    return assets.map((asset: any) => {
      // Convert BigInt values to numbers for easier handling
      const normalizedAsset: any = {
        ...asset,
        // Handle both property names
        'asset-id': asset['asset-id'] || (asset.assetId ? Number(asset.assetId) : undefined),
        assetId: asset.assetId ? Number(asset.assetId) : (asset['asset-id'] ? Number(asset['asset-id']) : undefined),
        amount: asset.amount ? Number(asset.amount) : 0
      }
      
      return normalizedAsset
    })
  } catch (error) {
    console.error('Error getting account assets:', error)
    throw new Error(`Failed to get assets for wallet: ${walletAddress}`)
  }
}

export async function checkAssetOwnership(walletAddress: string, assetId: number): Promise<boolean> {
  try {
    const assets = await getAccountAssets(walletAddress)
    // Try both property names: 'asset-id' (kebab-case) and 'assetId' (camelCase)
    const asset = assets.find((a: any) => 
      a['asset-id'] === assetId || a.assetId === assetId
    )
    return !!(asset && asset.amount > 0)
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
    sender: from,
    receiver: to,
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
    sender: from,
    receiver: to,
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
    sender: from,
    receiver: from, // Opt-in transaction sends to self
    assetIndex,
    amount: 0,
    suggestedParams
  })
}

export async function submitSignedTransaction(signedTxn: Uint8Array) {
  try {
    const response = await algodClient.sendRawTransaction(signedTxn).do()
    const txId = (response as any).txId
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

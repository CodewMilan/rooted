import dotenv from 'dotenv';
import algosdk from 'algosdk';

// Load .env.local file specifically
dotenv.config({ path: '.env.local' });

async function main() {
  const ALGOD_URL = process.env.ALGOD_URL || "https://testnet-api.algonode.cloud";
  const ALGOD_TOKEN = process.env.ALGOD_TOKEN || "";
  const ALGOD_PORT = process.env.ALGOD_PORT || "";
  const mnemonic = process.env.ALGOD_MNEMONIC;

  if (!mnemonic) {
    console.error("❌ Missing ALGOD_MNEMONIC in .env.local");
    process.exit(1);
  }

  // Clean and validate mnemonic
  const cleanMnemonic = mnemonic.trim();
  const words = cleanMnemonic.split(/\s+/);
  
  console.log("🔍 Mnemonic validation:");
  console.log("- Word count:", words.length);
  console.log("- First 3 words:", words.slice(0, 3).join(' '));
  console.log("- Last 3 words:", words.slice(-3).join(' '));
  
  if (words.length !== 25) {
    console.error("❌ Invalid mnemonic: Expected 25 words, got", words.length);
    console.error("💡 Make sure your ALGOD_MNEMONIC has exactly 25 words separated by spaces");
    process.exit(1);
  }

  let creator;
  try {
    creator = algosdk.mnemonicToSecretKey(cleanMnemonic);
  } catch (error) {
    console.error("❌ Failed to decode mnemonic:", error.message);
    console.error("💡 Check that your mnemonic words are valid Algorand mnemonic words");
    console.error("💡 Make sure there are no extra characters or formatting issues");
    process.exit(1);
  }
  console.log("Creator Address:", creator.addr);

  const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_URL, ALGOD_PORT);
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: creator.addr,
    total: 1000,
    decimals: 0,
    unitName: "TIX",
    assetName: "AUTHENTIX_EVENT",
    manager: creator.addr,
    reserve: creator.addr,
    freeze: creator.addr,
    clawback: creator.addr,
    defaultFrozen: false,
    suggestedParams: params,
  });

  const signed = txn.signTxn(creator.sk);
  const { txId } = await algodClient.sendRawTransaction(signed).do();
  console.log("⏳ Sent transaction:", txId);

  const result = await algosdk.waitForConfirmation(algodClient, txId, 4);
  const assetID = result["asset-index"];

  console.log("\n====================================");
  console.log("🚀 ASA Created Successfully!");
  console.log("Asset ID:", assetID);
  console.log("====================================\n");
}

main().catch(console.error);

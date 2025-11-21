const algosdk = require('algosdk');

// Configuration from your .env.local
const ALGOD_URL = "https://testnet-api.algonode.cloud";
const ORGANIZER_WALLET_ADDRESS = "OG7MBB2QNNORL3F3RB3IMBECKLXE3IZRKXCQGDAXOVHGDGFVR2PC6BCTBI";

// Initialize Algorand client
const algodClient = new algosdk.Algodv2('', ALGOD_URL, '');

async function createASA() {
  try {
    console.log('🎫 Creating AuthenTIX Event Ticket ASA...');
    
    // Get suggested parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    console.log('✅ Got suggested parameters');

    // Create ASA creation transaction
    const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: ORGANIZER_WALLET_ADDRESS,
      suggestedParams,
      
      // ASA Configuration
      total: 1000,  // Total supply of tickets
      decimals: 0,  // No decimals for tickets
      defaultFrozen: false,
      
      // Asset Names
      assetName: "AuthenTIX Launch Event Ticket",
      unitName: "TICKET",
      
      // Asset URLs and Metadata
      assetURL: "https://authentix.app/events/EVT1",
      assetMetadataHash: undefined,
      
      // Asset Control Addresses (all set to organizer for full control)
      manager: ORGANIZER_WALLET_ADDRESS,
      reserve: ORGANIZER_WALLET_ADDRESS,
      freeze: ORGANIZER_WALLET_ADDRESS,
      clawback: ORGANIZER_WALLET_ADDRESS,  // Important for anti-resell
      
      // Note
      note: new TextEncoder().encode("AuthenTIX Event Ticket - TestNet")
    });

    console.log('✅ ASA creation transaction prepared');
    console.log('\n📋 Transaction Details:');
    console.log('- Asset Name: AuthenTIX Launch Event Ticket');
    console.log('- Unit Name: TICKET');
    console.log('- Total Supply: 1000');
    console.log('- Decimals: 0');
    console.log('- Manager: ' + ORGANIZER_WALLET_ADDRESS);
    console.log('- Clawback: ' + ORGANIZER_WALLET_ADDRESS + ' (Anti-resell protection)');
    
    // Convert to base64 for signing
    const txnBase64 = Buffer.from(assetCreateTxn.toByte()).toString('base64');
    
    console.log('\n🔐 Transaction ready for signing:');
    console.log('Transaction (Base64):', txnBase64);
    
    console.log('\n📝 Next Steps:');
    console.log('1. Copy the transaction base64 above');
    console.log('2. Sign it with your Pera Wallet (organizer wallet)');
    console.log('3. Submit the signed transaction to get the ASA ID');
    console.log('4. Update your .env.local with: EVENT_ASA_ID=<your_asa_id>');
    console.log('5. Update the database with the ASA ID');
    
    return {
      txnBase64,
      assetCreateTxn
    };
    
  } catch (error) {
    console.error('❌ Error creating ASA:', error);
    throw error;
  }
}

// Run the script
createASA()
  .then((result) => {
    console.log('\n✅ ASA creation transaction prepared successfully!');
  })
  .catch((error) => {
    console.error('❌ Failed to create ASA:', error);
    process.exit(1);
  });

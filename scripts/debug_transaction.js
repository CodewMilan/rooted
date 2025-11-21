import algosdk from 'algosdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('Checking environment variables...');
const algodUrl = process.env.ALGOD_URL;
const algodToken = process.env.ALGOD_TOKEN || '';
const algodPort = process.env.ALGOD_PORT || '';
const organizerWallet = process.env.ORGANIZER_WALLET_ADDRESS;

console.log('ALGOD_URL:', algodUrl ? 'Set' : 'Missing');
console.log('ALGOD_TOKEN:', algodToken ? 'Set' : 'Empty (Optional)');
console.log('ALGOD_PORT:', algodPort ? 'Set' : 'Empty (Optional)');
console.log('ORGANIZER_WALLET_ADDRESS:', organizerWallet ? 'Set' : 'Missing');

if (!algodUrl || !organizerWallet) {
    console.error('CRITICAL: Missing required environment variables.');
    process.exit(1);
}

const algodClient = new algosdk.Algodv2(algodToken, algodUrl, algodPort);

async function testConnection() {
    try {
        console.log('Testing Algorand connection...');
        const params = await algodClient.getTransactionParams().do();
        console.log('Connection successful. Suggested params:', params);
        return params;
    } catch (error) {
        console.error('Connection failed:', error);
        throw error;
    }
}

async function testTransactionCreation(params) {
    try {
        console.log('Testing transaction creation...');
        // Dummy address for testing (must be valid format)
        const dummyAddress = algosdk.generateAccount().addr;

        console.log('Dummy Address (raw):', dummyAddress);
        console.log('Type of Dummy Address:', typeof dummyAddress);

        // Use a known valid address string for testing
        const testAddress = 'DUTKGEGFE7TNCNNC34J354EFP4VF2BWLZSWNMTDO7EAO6NCYJQPMDB7LLU';

        console.log('Validating addresses...');
        try {
            algosdk.decodeAddress(testAddress);
            console.log('testAddress is valid');
        } catch (e) {
            console.error('testAddress is INVALID:', e.message);
        }

        try {
            algosdk.decodeAddress(organizerWallet);
            console.log('organizerWallet is valid');
        } catch (e) {
            console.error('organizerWallet is INVALID:', e.message);
        }

        console.log('Attempting to create transaction...');

        // Try with makePaymentTxnWithSuggestedParamsFromObject
        try {
            console.log('Trying with from/to...');
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                from: testAddress,
                to: organizerWallet,
                amount: 1000000,
                suggestedParams: params,
                note: new TextEncoder().encode('Debug transaction')
            });
            console.log('Transaction created successfully (from/to)');
        } catch (e) {
            console.error('from/to failed:', e.message);
        }

        try {
            console.log('Trying with sender/receiver...');
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: testAddress,
                receiver: organizerWallet,
                amount: 1000000,
                suggestedParams: params,
                note: new TextEncoder().encode('Debug transaction')
            });
            console.log('Transaction created successfully (sender/receiver)');
        } catch (e) {
            console.error('sender/receiver failed:', e.message);
        }

        try {
            console.log('Trying AssetTransfer with sender/receiver...');
            const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                sender: testAddress,
                receiver: organizerWallet,
                assetIndex: 750013282,
                amount: 1,
                suggestedParams: params,
                note: new TextEncoder().encode('Debug transaction')
            });
            console.log('AssetTransfer created successfully');
        } catch (e) {
            console.error('AssetTransfer failed:', e.message);
        }
    } catch (error) {
        console.error('Transaction creation failed:', error);
        throw error;
    }
}

async function main() {
    try {
        const params = await testConnection();
        await testTransactionCreation(params);
        console.log('All checks passed.');
    } catch (error) {
        console.error('Debug script failed.');
        process.exit(1);
    }
}

main();

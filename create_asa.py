#!/usr/bin/env python3
"""
AuthenTIX – Algorand ASA Creation Script
Based on official Algorand SDK documentation
"""

import os
from dotenv import load_dotenv
from algosdk import mnemonic, account
from algosdk.v2client import algod
from algosdk import transaction


# -------------------------------------------------------
# Helper class to match official docs syntax (acct1.address, acct1.private_key)
# -------------------------------------------------------
class AlgoAccount:
    def __init__(self, private_key, address):
        self.private_key = private_key
        self.address = address


# -------------------------------------------------------
# Load environment variables
# -------------------------------------------------------
def load_env():
    load_dotenv(".env.local")
    
    ALGOD_URL = os.getenv("ALGOD_URL", "https://testnet-api.algonode.cloud")
    ALGOD_TOKEN = os.getenv("ALGOD_TOKEN", "")
    MNEMONIC = os.getenv("ALGOD_MNEMONIC")
    
    if not MNEMONIC:
        raise Exception("Missing ALGOD_MNEMONIC in .env.local")
    
    return ALGOD_URL, ALGOD_TOKEN, MNEMONIC


# -------------------------------------------------------
# Create account from 25-word Algorand mnemonic
# -------------------------------------------------------
def create_account_from_mnemonic(mnemonic_phrase):
    """Create account from Algorand 25-word mnemonic"""
    private_key = mnemonic.to_private_key(mnemonic_phrase)
    address = account.address_from_private_key(private_key)
    return AlgoAccount(private_key, address)


# -------------------------------------------------------
# Main script - following official Algorand docs format
# -------------------------------------------------------
def main():
    print("AuthenTIX ASA Creator - Algorand TestNet")
    print("=" * 60)
    
    # Load environment
    ALGOD_URL, ALGOD_TOKEN, MNEMONIC = load_env()
    
    # Create account from mnemonic
    print("\nDecoding mnemonic...")
    acct1 = create_account_from_mnemonic(MNEMONIC)
    print(f"Address: {acct1.address}")
    
    # Initialize algod client
    algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_URL)
    
    # Check balance
    try:
        acct_info = algod_client.account_info(acct1.address)
        balance = acct_info.get('amount', 0) / 1_000_000
        print(f"Balance: {balance} ALGO")
        
        if acct_info.get('amount', 0) < 100000:  # Less than 0.1 ALGO
            print("\nWARNING: Insufficient funds for transaction fees.")
            print("Get TestNet funds from: https://testnet.algoexplorer.io/dispenser")
            return
    except Exception as e:
        print(f"WARNING: Could not check balance: {e}")
    
    print("\nCreating ASA...")
    
    try:
        # Account 1 creates an asset called `rug` with a total supply
        # of 1000 units and sets itself to the freeze/clawback/manager/reserve roles
        sp = algod_client.suggested_params()
        
        txn = transaction.AssetConfigTxn(
            sender=acct1.address,
            sp=sp,
            default_frozen=False,
            unit_name="rug",
            asset_name="Really Useful Gift",
            manager=acct1.address,
            reserve=acct1.address,
            freeze=acct1.address,
            clawback=acct1.address,
            url="https://path/to/my/asset/details",
            total=1000,
            decimals=0,
        )
        
        # Sign with secret key of creator
        stxn = txn.sign(acct1.private_key)
        
        # Send the transaction to the network and retrieve the txid.
        txid = algod_client.send_transaction(stxn)
        print(f"Sent asset create transaction with txid: {txid}")
        
        # Wait for the transaction to be confirmed
        results = transaction.wait_for_confirmation(algod_client, txid, 4)
        print(f"Result confirmed in round: {results['confirmed-round']}")
        
        # grab the asset id for the asset we just created
        created_asset = results["asset-index"]
        print(f"Asset ID created: {created_asset}")
        
        print("\n" + "=" * 60)
        print("SUCCESS!")
        print("=" * 60)
        print(f"Asset ID: {created_asset}")
        print(f"View on AlgoExplorer: https://testnet.algoexplorer.io/asset/{created_asset}")
        print(f"Transaction: https://testnet.algoexplorer.io/tx/{txid}")
        print("=" * 60)
        
        # Save asset ID to file
        with open("asset_id.txt", "w") as f:
            f.write(str(created_asset))
        print("\nAsset ID saved to asset_id.txt")
        
    except Exception as e:
        print(f"\nERROR: {e}")


if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Algorand ASA Creation Script
Creates an ASA on TestNet using a 24-word BIP39 mnemonic
"""

import algosdk
from algosdk.v2client import algod
from algosdk.transaction import AssetCreateTxn, wait_for_confirmation
from algosdk import account, encoding
from bip_utils import Bip39SeedGenerator, Bip44, Bip44Coins, Bip44Changes
import base64
import nacl.signing
import nacl.encoding

def derive_algorand_keypair_from_bip39(mnemonic_words):
    """
    Derive Algorand keypair from 24-word BIP39 mnemonic
    Uses BIP44 derivation path: m/44'/283'/0'/0/0 (283 is Algorand's coin type)
    """
    try:
        # Generate seed from mnemonic
        seed_bytes = Bip39SeedGenerator(mnemonic_words).Generate()
        
        # Create BIP44 context for Algorand (coin type 283)
        bip44_mst_ctx = Bip44.FromSeed(seed_bytes, Bip44Coins.ALGORAND)
        
        # Derive account 0, change 0, address 0
        bip44_acc_ctx = bip44_mst_ctx.Purpose().Coin().Account(0)
        bip44_chg_ctx = bip44_acc_ctx.Change(Bip44Changes.CHAIN_EXT)
        bip44_addr_ctx = bip44_chg_ctx.AddressIndex(0)
        
        # Get the private key bytes (32 bytes for Ed25519)
        private_key_bytes = bip44_addr_ctx.PrivateKey().Raw().ToBytes()
        
        # Algorand uses a specific private key format: 32 bytes + 32 bytes public key
        # We need to generate the public key from the private key
        import nacl.signing
        import nacl.encoding
        
        # Create signing key from private key bytes
        signing_key = nacl.signing.SigningKey(private_key_bytes)
        public_key_bytes = signing_key.verify_key.encode()
        
        # Algorand private key format: private_key + public_key (64 bytes total)
        full_private_key = private_key_bytes + public_key_bytes
        
        # Convert to base64 format that algosdk expects
        private_key_b64 = base64.b64encode(full_private_key).decode('utf-8')
        
        # Generate the corresponding address
        address_str = account.address_from_private_key(private_key_b64)
        
        return private_key_b64, address_str
        
    except Exception as e:
        print(f"❌ Error deriving keypair: {e}")
        raise

def create_asa_on_testnet(private_key, address):
    """
    Create an ASA on Algorand TestNet
    """
    # TestNet Algod client (AlgoExplorer API)
    algod_address = "https://testnet-api.algonode.cloud"
    algod_token = ""
    
    # Initialize the algod client
    algod_client = algod.AlgodClient(algod_token, algod_address)
    
    try:
        # Get network suggested parameters
        params = algod_client.suggested_params()
        
        # Asset creation parameters
        asset_create_txn = AssetCreateTxn(
            sender=address,
            sp=params,
            total=1000,           # Total supply
            default_frozen=False, # Assets are not frozen by default
            unit_name="TIX",      # Unit name
            asset_name="AUTHENTIX_EVENT", # Asset name
            manager=address,      # Manager address
            reserve=address,      # Reserve address
            freeze=address,       # Freeze address
            clawback=address,     # Clawback address
            decimals=0            # Number of decimals (0 for NFT-like tickets)
        )
        
        # Sign the transaction
        signed_txn = asset_create_txn.sign(private_key)
        
        # Submit the transaction
        txid = algod_client.send_transaction(signed_txn)
        print(f"⏳ Transaction sent with ID: {txid}")
        
        # Wait for confirmation
        confirmed_txn = wait_for_confirmation(algod_client, txid, 4)
        
        # Get the asset ID from the transaction
        asset_id = confirmed_txn["asset-index"]
        
        return asset_id, txid
        
    except Exception as e:
        print(f"❌ Error creating ASA: {e}")
        raise

def main():
    """
    Main function to create ASA from BIP39 mnemonic
    """
    # Your 24-word BIP39 mnemonic
    mnemonic = "fresh toss cover wheat close federal behave symbol cover ribbon shine engine fiscal tuna scrub shed zoo lobster orchard april control satisfy youth sun"
    
    print("🚀 AuthenTIX ASA Creation Script")
    print("=" * 50)
    
    # Step 1: Derive Algorand keypair from BIP39 mnemonic
    print("📝 Deriving Algorand keypair from BIP39 mnemonic...")
    try:
        private_key, address = derive_algorand_keypair_from_bip39(mnemonic)
        print(f"✅ Derived Address: {address}")
    except Exception as e:
        print(f"❌ Failed to derive keypair: {e}")
        return
    
    # Step 2: Check account balance
    print("\n💰 Checking account balance...")
    try:
        algod_client = algod.AlgodClient("", "https://testnet-api.algonode.cloud")
        account_info = algod_client.account_info(address)
        balance = account_info.get('amount', 0) / 1_000_000  # Convert microAlgos to Algos
        print(f"✅ Account Balance: {balance} ALGO")
        
        if balance < 0.1:
            print("⚠️  Warning: Low balance. You need at least 0.1 ALGO for transaction fees.")
            print("💡 Get TestNet funds from: https://testnet.algoexplorer.io/dispenser")
    except Exception as e:
        print(f"⚠️  Could not check balance: {e}")
    
    # Step 3: Create ASA
    print("\n🎫 Creating ASA on TestNet...")
    try:
        asset_id, txid = create_asa_on_testnet(private_key, address)
        
        print("\n" + "=" * 50)
        print("🎉 ASA CREATED SUCCESSFULLY!")
        print("=" * 50)
        print(f"🆔 Asset ID: {asset_id}")
        print(f"📋 Transaction ID: {txid}")
        print(f"🔗 View on AlgoExplorer: https://testnet.algoexplorer.io/asset/{asset_id}")
        print(f"🔗 Transaction: https://testnet.algoexplorer.io/tx/{txid}")
        print("=" * 50)
        
        # Save asset ID to file for easy reference
        with open("asset_id.txt", "w") as f:
            f.write(str(asset_id))
        print(f"💾 Asset ID saved to: asset_id.txt")
        
    except Exception as e:
        print(f"❌ Failed to create ASA: {e}")
        return

if __name__ == "__main__":
    main()

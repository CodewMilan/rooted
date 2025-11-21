#!/usr/bin/env python3
"""
AuthenTIX – Algorand ASA Creation Script (Correct Version)

This version:
- Works with Pera Wallet 24-word mnemonics (Algorand-native)
- Uses ONLY algosdk.mnemonic (correct for Algorand)
- Creates ASA on TestNet using AlgoNode API
"""

import os
from dotenv import load_dotenv

import algosdk
from algosdk import mnemonic
from algosdk.v2client import algod
from algosdk.transaction import AssetCreateTxn, wait_for_confirmation


# -------------------------------------------------------
# Load env from .env.local
# -------------------------------------------------------
def load_env():
    load_dotenv(".env.local")

    ALGOD_URL = os.getenv("ALGOD_URL", "https://testnet-api.algonode.cloud")
    ALGOD_TOKEN = os.getenv("ALGOD_TOKEN", "")
    MNEMONIC = os.getenv("ALGOD_MNEMONIC")
    ORGANIZER_ADDRESS = os.getenv("ORGANIZER_WALLET_ADDRESS")

    if not MNEMONIC:
        raise Exception("❌ Missing ALGOD_MNEMONIC in .env.local")

    return ALGOD_URL, ALGOD_TOKEN, MNEMONIC, ORGANIZER_ADDRESS


# -------------------------------------------------------
# Decode Algorand-native mnemonic (Pera Wallet)
# -------------------------------------------------------
def derive_keypair_from_algorand_mnemonic(mn):
    try:
        private_key = mnemonic.to_private_key(mn)
        address = mnemonic.to_public_key(mn)
        return private_key, address
    except Exception as e:
        raise Exception(f"❌ Failed to decode Algorand mnemonic: {e}")


# -------------------------------------------------------
# Create ASA on TestNet
# -------------------------------------------------------
def create_asa(algod_client, private_key, address):
    print("📡 Fetching suggested params...")
    params = algod_client.suggested_params()

    txn = AssetCreateTxn(
        sender=address,
        sp=params,
        total=1000,                  # total supply of tickets
        decimals=0,                  # no decimals
        default_frozen=False,
        unit_name="TIX",
        asset_name="AUTHENTIX_EVENT",
        manager=address,
        reserve=address,
        freeze=address,
        clawback=address
    )

    print("✍️  Signing transaction...")
    signed_txn = txn.sign(private_key)

    print("🚀 Sending transaction...")
    txid = algod_client.send_transaction(signed_txn)
    print(f"⏳ Sent txid: {txid}")

    print("⏱ Waiting for confirmation...")
    confirmed = wait_for_confirmation(algod_client, txid, 4)

    asset_id = confirmed["asset-index"]
    return asset_id, txid


# -------------------------------------------------------
# Main
# -------------------------------------------------------
def main():
    print("🚀 AuthenTIX ASA Creator – Algorand TestNet")
    print("=" * 60)

    ALGOD_URL, ALGOD_TOKEN, MNEMONIC, ORGANIZER_ADDR = load_env()

    print("\n📝 Decoding mnemonic...")
    private_key, derived_address = derive_keypair_from_algorand_mnemonic(MNEMONIC)
    print(f"✅ Address from mnemonic: {derived_address}")

    if ORGANIZER_ADDR and ORGANIZER_ADDR != derived_address:
        print("\n⚠️ WARNING: Organizer address does NOT match mnemonic address!")
        print(f"   ORGANIZER_WALLET_ADDRESS: {ORGANIZER_ADDR}")
        print(f"   Derived from mnemonic:    {derived_address}")
        print("   Fix this in .env.local before creating ASA.\n")
        return

    algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_URL)

    print("\n💰 Checking balance...")
    info = algod_client.account_info(derived_address)
    balance = info.get("amount", 0) / 1_000_000
    print(f"   Balance: {balance} ALGO")

    if balance < 0.1:
        print("⚠️ Low balance — fund using TestNet dispenser:")
        print("   👉 https://testnet.algoexplorer.io/dispenser")
        return

    print("\n🎫 Creating ASA...")
    try:
        asset_id, txid = create_asa(algod_client, private_key, derived_address)

        print("\n" + "=" * 60)
        print("🎉 ASA CREATED SUCCESSFULLY!")
        print("=" * 60)
        print(f"🆔 Asset ID: {asset_id}")
        print(f"📋 TxID: https://testnet.algoexplorer.io/tx/{txid}")
        print(f"🔗 Asset: https://testnet.algoexplorer.io/asset/{asset_id}")
        print("=" * 60)

        with open("asset_id.txt", "w") as f:
            f.write(str(asset_id))
        print("💾 Saved to asset_id.txt")

    except Exception as e:
        print(f"❌ ASA creation failed: {e}")


if __name__ == "__main__":
    main()

/**
 * One-time setup: placeholder for registering an ENS name on Sepolia.
 *
 * Full on-chain ENS registration requires the ENS registrar contract and ETH for gas.
 * For the hackathon demo, ENS resolution is hardcoded in frontend/src/lib/ens.ts.
 * Use this script to record the wallet address ↔ ENS name mapping you'll hardcode.
 *
 * Usage (from server/): npx tsx scripts/registerENS.ts
 */

import 'dotenv/config';
import { ethers } from 'ethers';

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL ?? process.env.VITE_SEPOLIA_RPC_URL;

  if (!rpcUrl) {
    throw new Error('SEPOLIA_RPC_URL must be set in .env');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);

  const ensName = 'belgrade-university.eth';

  console.log(`\nResolving ${ensName} on Sepolia...`);
  const address = await provider.resolveName(ensName);

  if (address) {
    console.log(`  ${ensName} → ${address}`);
    console.log(`\nAdd this to your frontend/src/lib/ens.ts fallback map:\n  "${address}": "${ensName}"\n`);
  } else {
    console.log(`  ${ensName} is not registered or not resolved on this network.`);
    console.log('\nRegister ENS names at https://app.ens.domains (switch to Sepolia testnet).');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

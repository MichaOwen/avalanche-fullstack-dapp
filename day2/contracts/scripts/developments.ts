import { viem } from "hardhat";

import Artifact from "../artifacts/contracts/simpleStorage.sol/SimpleStorage.json";

async function main() {
  // Wallet client (signer)
    const [walletClient] = await viem.getWalletClients();

  // Public client (read-only)
    const publicClient = await viem.getPublicClient();

    console.log("Deploying with account:", walletClient.account.address);

  // Deploy contract
    const hash = await walletClient.deployContract({
    abi: Artifact.abi,
    bytecode: Artifact.bytecode as `0x${string}`,
    args: [],
    });

    console.log("Deployment tx hash:", hash);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    });

    console.log("✅ SimpleStorage deployed at:", receipt.contractAddress);

    // Simpan contract address dan abi json
    const fs = require("fs");
    fs.writeFileSync(
        "./deployed.json",
        JSON.stringify({
        address: receipt.contractAddress,
        abi: Artifact.abi,
    }, null, 2)
);
console.log("Contract address dan abi simpan ke package.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
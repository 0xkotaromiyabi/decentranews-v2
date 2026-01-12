const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

async function main() {
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia.publicnode.com";
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error("PRIVATE_KEY not found in .env.local");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Deploying with account: ${wallet.address}`);

    // Helper to load artifact
    const loadArtifact = (contractPath, contractName) => {
        const p = path.join(__dirname, "../artifacts/contracts", contractPath, `${contractName}.json`);
        const content = fs.readFileSync(p, "utf8");
        return JSON.parse(content);
    };

    // 1. Deploy ERC6551Account
    console.log("Deploying ERC6551Account...");
    const accountArtifact = loadArtifact("tba/ERC6551Account.sol", "ERC6551Account");
    const AccountFactory = new ethers.ContractFactory(accountArtifact.abi, accountArtifact.bytecode, wallet);
    const accountImpl = await AccountFactory.deploy();
    await accountImpl.waitForDeployment();
    console.log(`ERC6551Account deployed to: ${await accountImpl.getAddress()}`);

    // 2. Deploy WriteNFT
    console.log("Deploying WriteNFT...");
    const writeNftArtifact = loadArtifact("nft/WriteNFT.sol", "WriteNFT");
    const WriteNFTFactory = new ethers.ContractFactory(writeNftArtifact.abi, writeNftArtifact.bytecode, wallet);
    const writeNFT = await WriteNFTFactory.deploy(wallet.address);
    await writeNFT.waitForDeployment();
    console.log(`WriteNFT deployed to: ${await writeNFT.getAddress()}`);

    // 3. Deploy TBAManager
    console.log("Deploying TBAManager...");
    const tbaManagerArtifact = loadArtifact("tba/TBAManager.sol", "TBAManager");
    const REGISTRY_ADDRESS = "0x000000006551c19487814612e58FE06813775758";
    const TBAManagerFactory = new ethers.ContractFactory(tbaManagerArtifact.abi, tbaManagerArtifact.bytecode, wallet);
    const tbaManager = await TBAManagerFactory.deploy(REGISTRY_ADDRESS, await accountImpl.getAddress());
    await tbaManager.waitForDeployment();
    console.log(`TBAManager deployed to: ${await tbaManager.getAddress()}`);

    console.log("\n--- DEPLOYMENT COMPLETE ---");
    console.log(`ERC6551Account: ${await accountImpl.getAddress()}`);
    console.log(`WriteNFT:       ${await writeNFT.getAddress()}`);
    console.log(`TBAManager:     ${await tbaManager.getAddress()}`);
    console.log(`Registry:       ${REGISTRY_ADDRESS}`);
}

main().catch(console.error);

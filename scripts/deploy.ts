import { formatEther, parseEther } from "viem";
import hre from "hardhat";

async function main() {
    const [deployer] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    console.log(
        `Deploying contracts with the account: ${deployer.account.address}`
    );

    // 1. Deploy Implementation (ERC6551 Account)
    console.log("Deploying ERC6551Account implementation...");
    const accountImpl = await hre.viem.deployContract("ERC6551Account");
    console.log(`ERC6551Account deployed to ${accountImpl.address}`);

    // 2. Deploy WriteNFT (Identity)
    console.log("Deploying WriteNFT...");
    const writeNFT = await hre.viem.deployContract("WriteNFT", [deployer.account.address]);
    console.log(`WriteNFT deployed to ${writeNFT.address}`);

    // 3. Deploy TBAManager (Optional Helper)
    // We need standard Registry address. For Base Sepolia:
    const REGISTRY_ADDRESS = "0x000000006551c19487814612e58FE06813775758"; // Standard v3 Registry

    console.log("Deploying TBAManager...");
    const tbaManager = await hre.viem.deployContract("TBAManager", [
        REGISTRY_ADDRESS,
        accountImpl.address
    ]);
    console.log(`TBAManager deployed to ${tbaManager.address}`);

    console.log("\nVerified Deployments:");
    console.log("-----------------------------------");
    console.log(`Implementation : ${accountImpl.address}`);
    console.log(`WriteNFT       : ${writeNFT.address}`);
    console.log(`TBAManager     : ${tbaManager.address}`);
    console.log(`Registry       : ${REGISTRY_ADDRESS}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

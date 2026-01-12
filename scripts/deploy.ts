import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy Implementation (ERC6551 Account)
    console.log("Deploying ERC6551Account implementation...");
    const Account = await ethers.getContractFactory("ERC6551Account");
    const accountImpl = await Account.deploy();
    await accountImpl.waitForDeployment();
    const accountImplAddress = await accountImpl.getAddress();
    console.log(`ERC6551Account deployed to ${accountImplAddress}`);

    // 2. Deploy WriteNFT (Identity)
    console.log("Deploying WriteNFT...");
    const WriteNFT = await ethers.getContractFactory("WriteNFT");
    const writeNFT = await WriteNFT.deploy(deployer.address);
    await writeNFT.waitForDeployment();
    const writeNFTAddress = await writeNFT.getAddress();
    console.log(`WriteNFT deployed to ${writeNFTAddress}`);

    // 3. Deploy TBAManager (Optional Helper)
    const REGISTRY_ADDRESS = "0x000000006551c19487814612e58FE06813775758";

    console.log("Deploying TBAManager...");
    const TBAManager = await ethers.getContractFactory("TBAManager");
    const tbaManager = await TBAManager.deploy(
        REGISTRY_ADDRESS,
        accountImplAddress
    );
    await tbaManager.waitForDeployment();
    const tbaManagerAddress = await tbaManager.getAddress();
    console.log(`TBAManager deployed to ${tbaManagerAddress}`);

    console.log("\nVerified Deployments:");
    console.log("-----------------------------------");
    console.log(`Implementation : ${accountImplAddress}`);
    console.log(`WriteNFT       : ${writeNFTAddress}`);
    console.log(`TBAManager     : ${tbaManagerAddress}`);
    console.log(`Registry       : ${REGISTRY_ADDRESS}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

import { createThirdwebClient, getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";

export const client = createThirdwebClient({
    clientId: "617f0bafe0b0393c58520cdb31da7636",
});

// WriteNFT ERC1155 Contract Address on Sepolia
export const writeNftContractAddress = "0x397Fe4FC8B20c3fAc12Fcb5636b2a8cfdC0248ef";

export const contract = getContract({
    client,
    chain: sepolia,
    address: writeNftContractAddress,
});

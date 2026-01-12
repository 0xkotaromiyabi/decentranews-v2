import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { eth_call } from "thirdweb/rpc";
import { getContractEvents } from "thirdweb/event";

// Initialize Thirdweb Client
const client = createThirdwebClient({
    clientId: process.env.THIRDWEB_CLIENT_ID || "",
    secretKey: process.env.THIRDWEB_SECRET_KEY || "",
});

// Configure Chain (Base Sepolia)
export const chain = defineChain(84532);

// Standard ERC-6551 Registry
const REGISTRY_ADDRESS = "0x000000006551c19487814612e58FE06813775758";

// Registry ABI (Minimal)
const REGISTRY_ABI = [
    {
        inputs: [
            { internalType: "address", name: "implementation", type: "address" },
            { internalType: "bytes32", name: "salt", type: "bytes32" },
            { internalType: "uint256", name: "chainId", type: "uint256" },
            { internalType: "address", name: "tokenContract", type: "address" },
            { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        name: "account",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "implementation", type: "address" },
            { internalType: "bytes32", name: "salt", type: "bytes32" },
            { internalType: "uint256", name: "chainId", type: "uint256" },
            { internalType: "address", name: "tokenContract", type: "address" },
            { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        name: "createAccount",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;

export const registryContract = getContract({
    client,
    chain,
    address: REGISTRY_ADDRESS,
    abi: REGISTRY_ABI,
});

/**
 * Computes the TBA address for a given NFT.
 * Uses a fixed implementation address (must be deployed first) and salt=0.
 * @param implementationAddress The address of our custom ERC6551Account implementation
 * @param tokenContract The WriteNFT contract address
 * @param tokenId The Article ID
 */
export async function getArticleAccount(
    implementationAddress: string,
    tokenContract: string,
    tokenId: string
): Promise<string> {
    const account = await registryContract.read.account([
        implementationAddress,
        "0x0000000000000000000000000000000000000000000000000000000000000000", // salt = 0
        BigInt(chain.id),
        tokenContract,
        BigInt(tokenId)
    ]);
    return account;
}

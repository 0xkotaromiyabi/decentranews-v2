import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Validate Thirdweb credentials
const THIRDWEB_CLIENT_ID = process.env.THIRDWEB_CLIENT_ID;
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

if (!THIRDWEB_CLIENT_ID && !THIRDWEB_SECRET_KEY) {
    throw new Error(
        'Thirdweb credentials not configured. Set THIRDWEB_CLIENT_ID or THIRDWEB_SECRET_KEY in environment variables.'
    );
}

// Initialize Thirdweb Client
const client = createThirdwebClient({
    clientId: THIRDWEB_CLIENT_ID,
    secretKey: THIRDWEB_SECRET_KEY,
});

// Configure Chain (Sepolia)
export const chain = defineChain(11155111);

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
    const account = await readContract({
        contract: registryContract,
        method: "account",
        params: [
            implementationAddress,
            "0x0000000000000000000000000000000000000000000000000000000000000000", // salt = 0
            BigInt(chain.id),
            tokenContract,
            BigInt(tokenId)
        ]
    });
    return account;
}

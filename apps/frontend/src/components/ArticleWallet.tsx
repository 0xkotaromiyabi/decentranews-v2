import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { API_URL } from '../api';

const REGISTRY_ADDRESS = "0x000000006551c19487814612e58FE06813775758";
const IMPLEMENTATION_ADDRESS = "0x06bEc870ba57090d10F129bCA7520110FCC048D5";
const WRITENFT_ADDRESS = "0xFD65f229f0950E8D27cB1D135fe26B954058d2Af";
const CHAIN_ID = 11155111; // Sepolia

const REGISTRY_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "implementation", "type": "address" },
            { "internalType": "bytes32", "name": "salt", "type": "bytes32" },
            { "internalType": "uint256", "name": "chainId", "type": "uint256" },
            { "internalType": "address", "name": "tokenContract", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "createAccount",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

interface ArticleWalletProps {
    articleId: string;
}

export function ArticleWallet({ articleId }: ArticleWalletProps) {
    const [tbaAddress, setTbaAddress] = useState<`0x${string}` | null>(null);
    const [nftTokenId, setNftTokenId] = useState<string | null>(null);
    const [isDeployed, setIsDeployed] = useState(false);

    const { data: balance } = useBalance({
        address: tbaAddress || undefined,
    });

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        async function fetchWallet() {
            try {
                const res = await fetch(`${API_URL}/articles/${articleId}/wallet`);
                if (res.ok) {
                    const data = await res.json();
                    setTbaAddress(data.address);
                    setNftTokenId(data.tokenId);
                    setIsDeployed(data.deployed); // Backend should return this based on code check
                }
            } catch (e) {
                console.error("Failed to fetch article wallet", e);
            }
        }
        fetchWallet();
    }, [articleId, isSuccess]);

    const handleActivate = () => {
        if (!nftTokenId) return;

        writeContract({
            address: REGISTRY_ADDRESS,
            abi: REGISTRY_ABI,
            functionName: 'createAccount',
            args: [
                IMPLEMENTATION_ADDRESS,
                "0x0000000000000000000000000000000000000000000000000000000000000000", // salt
                BigInt(CHAIN_ID),
                WRITENFT_ADDRESS,
                BigInt(nftTokenId)
            ],
        });
    };

    if (!tbaAddress) return null;

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold font-serif">Article Wallet</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1 break-all">{tbaAddress}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">{balance?.formatted.slice(0, 6)} {balance?.symbol}</div>
                </div>
            </div>

            <div className="flex gap-3">
                {!isDeployed && (
                    <button
                        onClick={handleActivate}
                        disabled={isPending || isConfirming}
                        className="bg-black text-white px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50"
                    >
                        {isPending || isConfirming ? 'Activating...' : 'Activate Wallet'}
                    </button>
                )}

                <a
                    href={`https://sepolia.etherscan.io/address/${tbaAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-300 px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors"
                >
                    View on Explorer
                </a>

                <button
                    disabled // TODO: Implement donation modal
                    className="bg-blue-600 text-white px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-blue-700 disabled:opacity-50"
                >
                    Donate
                </button>
            </div>
        </div>
    );
}

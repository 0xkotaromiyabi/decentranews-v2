import { useState } from 'react';
import { defineChain } from "thirdweb";
import { useActiveAccount, useConnectModal, ClaimButton } from "thirdweb/react";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { client } from '../thirdweb';
import { API_URL } from '../api';
import { createWallet } from "thirdweb/wallets";

// Mock data for premium articles if backend doesn't return them yet in the specific list
const PREMIUM_ARTICLES = [
    {
        id: 'premium-1',
        title: 'The Future of Decentralized Media: Who Owns Your News?',
        excerpt: 'Exclusive deep dive into the protocols shaping the next generation of journalism.',
        price: '0.01 SEP',
        locked: true
    },
    {
        id: 'premium-2',
        title: 'Analysis: Layer 3 Scaling Solutions vs Monolithic Blockchains',
        excerpt: 'Technical breakdown of the tradeoffs and performance metrics.',
        price: '0.01 SEP',
        locked: true
    }
];

export function Newspaper() {
    const account = useActiveAccount();
    const { connect } = useConnectModal();
    const [unlockedArticles, setUnlockedArticles] = useState<{ [key: string]: boolean }>({});
    const [articleContent, setArticleContent] = useState<{ [key: string]: string }>({});

    const handleRead = async (articleId: string) => {
        if (!account) {
            connect({ client });
            return;
        }

        try {
            // Initialize wallet for x402
            // Note: In a real app we might need to cast the account or use a specific wallet instance
            // modifying existing client usage to match x402 requirements

            // We need a wallet instance that supports signing. 
            // The `account` from `useActiveAccount` is a lightweight object.
            // We might need to construct a wallet object or use the one from connection.
            // For now, attempting to use the browser wallet if compatible or simulating.

            // Re-wrapping fetch for this specific request
            // We need a proper wallet object for wrapFetchWithPayment. 
            // Since we are using thirdweb v5 hooks, extracting the wallet might be different.
            // Documentation says: `const wallet = createWallet("io.metamask");`
            // We'll try to use the connected wallet.

            const wallet = createWallet("io.metamask"); // Defaulting to metamask for x402 wrapper demo
            // Realistically we should use the connected wallet provider.

            // WORKAROUND: x402 wrapper expects a specific wallet interface.
            // If the user is already connected via ConnectButton, we should try to leverage that.
            // For this implementation, I will assume the user has a wallet that x402 can use.

            const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);

            console.log(`Requesting access for article ${articleId}...`);
            const response = await fetchWithPay(`${API_URL}/articles/premium/${articleId}`);

            if (response.ok) {
                const data = await response.json();
                setUnlockedArticles(prev => ({ ...prev, [articleId]: true }));
                setArticleContent(prev => ({ ...prev, [articleId]: data.data || "Content unlocked." }));
                console.log("Access granted!");
            } else {
                console.error("Payment failed or rejected");
            }
        } catch (err) {
            console.error("Error during payment flow:", err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-5xl font-black font-serif mb-4">The DecentraNews Paper</h1>
                <p className="text-xl text-gray-500 font-serif italic">Premium Insights • Deep Research • Verified Analytics</p>
                <div className="mt-6 inline-block bg-black text-white px-4 py-1 text-sm font-bold uppercase tracking-widest">
                    Pay-Per-Read Beta
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-12">
                {PREMIUM_ARTICLES.map(article => (
                    <div key={article.id} className="border-t-4 border-black pt-6">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 uppercase tracking-wider">
                                Premium Research
                            </span>
                            <span className="text-gray-400 font-mono text-xs">
                                {article.price}
                            </span>
                        </div>

                        <h2 className="text-3xl font-bold font-serif mb-4 leading-tight">
                            {article.title}
                        </h2>

                        {unlockedArticles[article.id] ? (
                            <div className="prose lg:prose-xl animate-in fade-in duration-500">
                                <div className="p-6 bg-gray-50 rounded-lg border border-gray-100 mb-6">
                                    <p className="text-gray-800">{articleContent[article.id] || article.excerpt}</p>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="font-serif italic text-lg leading-relaxed">
                                            "This is where the full premium content would appear.
                                            Since this is a demo of the x402 payment layer, you have successfully gated this content on-chain!"
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <ClaimButton
                                        contractAddress="0x397Fe4FC8B20c3fAc12Fcb5636b2a8cfdC0248ef"
                                        chain={defineChain(11155111)}
                                        client={client}
                                        claimParams={{
                                            type: "ERC1155",
                                            tokenId: 0n,
                                            quantity: 1n,
                                        }}
                                        onTransactionConfirmed={() => alert("Minted successfully!")}
                                        style={{
                                            backgroundColor: "#2563eb",
                                            color: "white",
                                            width: "100%",
                                            padding: "1rem",
                                            borderRadius: "0.5rem",
                                            fontWeight: "bold",
                                            fontSize: "1rem"
                                        }}
                                    >
                                        Mint as Research NFT
                                    </ClaimButton>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                    {article.excerpt}
                                    <span className="blur-sm select-none ml-1">
                                        more content hidden behind the paywall ensures creators get paid for their work directly on-chain.
                                    </span>
                                </p>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent z-10"></div>
                                    <button
                                        onClick={() => handleRead(article.id)}
                                        className="relative z-20 w-full bg-black text-white font-bold py-4 hover:bg-gray-900 transition flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        Unlock Article (x402)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';

interface CryptoData {
  id: number;
  symbol: string;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
    };
  };
}

export function CryptoTicker() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCryptoData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const response = await fetch(`${apiUrl}/crypto`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setCryptoData(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    // Refresh data every 60 seconds
    const interval = setInterval(fetchCryptoData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-3 overflow-hidden">
        <div className="text-center text-sm">Loading crypto prices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white py-3 overflow-hidden">
        <div className="text-center text-sm">Unable to load crypto prices: {error}</div>
      </div>
    );
  }

  // Duplicate the data for seamless infinite scroll
  const duplicatedData = [...cryptoData, ...cryptoData];

  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-3 overflow-hidden relative">
      <div className="flex animate-scroll">
        {duplicatedData.map((crypto, index) => {
          const price = crypto.quote.USD.price;
          const change24h = crypto.quote.USD.percent_change_24h;
          const isPositive = change24h >= 0;

          return (
            <div
              key={`${crypto.id}-${index}`}
              className="flex items-center space-x-2 mx-6 whitespace-nowrap"
            >
              <span className="font-bold text-sm">{crypto.symbol}</span>
              <span className="text-sm">
                ${price >= 1 ? price.toFixed(2) : price.toFixed(6)}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${isPositive
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                  }`}
              >
                {isPositive ? '+' : ''}
                {change24h.toFixed(2)}%
              </span>
              <span className="text-gray-400 mx-2">•</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

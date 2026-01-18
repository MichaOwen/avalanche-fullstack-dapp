"use client";

import { useEffect, useState } from "react";
import { getBlockchainValue } from "@/services/blockchain.services";

export default function BlockchainValue() {
  const [value, setValue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBlockchainValue();
        setValue(data);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p>Loading blockchain data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <pre className="bg-black p-3 rounded text-sm">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

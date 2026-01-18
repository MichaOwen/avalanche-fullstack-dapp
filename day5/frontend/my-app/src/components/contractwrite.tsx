"use client";

import { useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { SIMPLE_STORAGE_ABI } from "../contracts/abi/simpleStorage";

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function ContractWrite() {
  const [value, setValue] = useState("");

  const {
    data: hash,
    writeContract,
    isPending,
    error,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  function handleSetValue() {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_STORAGE_ABI,
      functionName: "setValue",
      args: [BigInt(value)],
    });
  }

  return (
    <div className="space-y-2">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="p-2 border rounded w-full"
        placeholder="New value"
      />

      <button
        onClick={handleSetValue}
        disabled={isPending}
        className="bg-blue-600 px-4 py-2 rounded w-full"
      >
        {isPending ? "Sending..." : "Set Value"}
      </button>

      {isConfirming && <p>Waiting for confirmation...</p>}
      {isSuccess && <p className="text-green-500">Transaction success ✅</p>}
      {error && <p className="text-red-500">Transaction failed ❌</p>}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from 'wagmi';
import { injected } from 'wagmi/connectors';

// ==============================
//  CONFIG
// ==============================

// GANTI dengan contract address hasil deploy kamu day 2
const CONTRACT_ADDRESS = '0x86F3f692C8Ebf76Dc5bB99f712fd6c7Fc9975f76';
const REQUIRED_CHAIN_ID = 43113;


//  ABI SIMPLE STORAGE
const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: 'getValue',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_value', type: 'uint256' }],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const shortAddress = (addr?: string) => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function Page() {
  // ==============================
  //  WALLET STATE
  // ==============================
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  // ==============================
  //  LOCAL STATE
  // ==============================
  const [inputValue, setInputValue] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();




  // ==============================
  //  READ CONTRACT
  // ==============================
  const {
    data: value,
    isLoading: isReading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
  });

  // ==============================
  //  WRITE CONTRACT
  // ==============================
  const {
    writeContract,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        setTxHash(hash);
        setTxStatus('confirming');
      },
      onError: () => {
        setTxStatus('error');
      },
    },
  });


  const [txStatus, setTxStatus] = useState< 'idle' | 'sending' | 'confirming' | 'success' | 'error' >('idle');



  // transaction (CONFIRMATION)
  const { isSuccess: isConfirmed, isLoading: isConfirming } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // useEffect DI SINI
  useEffect(() => {
    if (isConfirmed) {
      refetch();
      setTxStatus('success');
    }
  }, [isConfirmed, refetch]);


  const handleSetValue = async () => {
    if (!isConnected) return;
      if (chainId !== REQUIRED_CHAIN_ID) {
      alert('Please switch to Avalanche network');
      return;
    }
    if (!inputValue) return;

    setTxStatus('sending');

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_STORAGE_ABI,
      functionName: 'setValue',
      args: [BigInt(inputValue)],
    });
  };


  
  
  const getErrorMessage = (error: any) => {
  if (!error) return null;

  if (
    error.message?.includes('User rejected') ||
    error.message?.includes('rejected')
  ) {
    return 'Transaction cancelled by user';
  }

  if (error.message?.includes('revert')) {
    return 'Transaction reverted';
  }

  return 'Transaction failed';
};


  // ==============================
  //  UI
  // ==============================
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md border border-gray-700 rounded-lg p-6 space-y-6">

        <h1 className="text-xl font-bold">
          Day 3 – Frontend dApp (Avalanche)
        </h1>
        <p className="text-sm text-gray-400">
          Network: {chainId}
        </p>
        {isConnected && chainId !== REQUIRED_CHAIN_ID && (
          <p className="text-yellow-400 text-sm">
            Wrong network. Please switch to Avalanche.
          </p>
        )}
        {writeError && (
          <p className="text-red-400 text-sm">
            {getErrorMessage(writeError)}
          </p>
        )}
        {txStatus === 'sending' && (
          <p className="text-yellow-400 text-sm">Sending transaction...</p>
        )}

        {txStatus === 'confirming' && (
          <p className="text-blue-400 text-sm">Waiting for confirmation...</p>
        )}

        {txStatus === 'success' && (
          <p className="text-green-400 text-sm">Transaction success ✅</p>
        )}

        {txStatus === 'error' && (
          <p className="text-red-400 text-sm">Transaction failed ❌</p>
        )}


        {/* ==========================
            WALLET CONNECT
        ========================== */}
        {!isConnected ? (
          
          <button
            onClick={() => connect({ connector: injected() })}
            disabled={isConnecting}
            className="w-full bg-white text-black py-2 rounded"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Connected Address</p>
            <p className="font-mono text-sm">{shortAddress(address)}</p>

            <button
              onClick={() => disconnect()}
              className="text-red-400 text-sm underline"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* ==========================
            READ CONTRACT
        ========================== */}
        <div className="border-t border-gray-700 pt-4 space-y-2">
          <p className="text-sm text-gray-400">Contract Value (read)</p>

          {isReading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-2xl font-bold">{value?.toString()}</p>
          )}

          <button
            onClick={() => refetch()}
            className="text-sm underline text-gray-300"
          >
            Refresh value
          </button>
        </div>

        {/* ==========================
            WRITE CONTRACT
        ========================== */}
        <div className="border-t border-gray-700 pt-4 space-y-3">
          <p className="text-sm text-gray-400">Update Contract Value</p>

          <input
            type="number"
            placeholder="New value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 rounded bg-black border border-gray-600"
          />

        <button
            onClick={handleSetValue}
            disabled={isWriting || isConfirming}
            className="w-full bg-blue-600 py-2 rounded"
          >
            {isWriting
              ? 'Sending...'
              : isConfirming
              ? 'Confirming...'
              : 'Set Value'}
          </button>
        </div>

        {/* ==========================
            FOOTNOTE
        ========================== */}
        <p className="text-xs text-gray-500 pt-2">
          Smart contract = single source of truth
        </p>

      </div>
    </main>
  );
}

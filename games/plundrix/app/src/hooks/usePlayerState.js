import { useReadContract } from 'wagmi';
import { PLUNDRIX_ABI, PLUNDRIX_ADDRESS } from '../config/contract';

export function usePlayerState(gameId, playerAddr) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    functionName: 'getPlayerState',
    args: gameId && playerAddr ? [BigInt(gameId), playerAddr] : undefined,
    query: { enabled: !!gameId && !!playerAddr, refetchInterval: 5000 },
  });

  return {
    locksCracked: data?.[0],
    tools: data?.[1],
    stunned: data?.[2],
    registered: data?.[3],
    actionSubmitted: data?.[4],
    isLoading,
    error,
    refetch,
  };
}

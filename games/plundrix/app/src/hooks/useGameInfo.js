import { useReadContract } from 'wagmi';
import { PLUNDRIX_ABI, PLUNDRIX_ADDRESS } from '../config/contract';

export function useGameInfo(gameId) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    functionName: 'getGameInfo',
    args: gameId ? [BigInt(gameId)] : undefined,
    query: { enabled: !!gameId, refetchInterval: 5000 },
  });

  return {
    state: data?.[0],
    currentRound: data?.[1],
    playerCount: data?.[2],
    roundStartTime: data?.[3],
    winner: data?.[4],
    isLoading,
    error,
    refetch,
  };
}

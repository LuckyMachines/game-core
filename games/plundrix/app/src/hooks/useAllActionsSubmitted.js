import { useReadContract } from 'wagmi';
import { PLUNDRIX_ABI, PLUNDRIX_ADDRESS } from '../config/contract';

export function useAllActionsSubmitted(gameId) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    functionName: 'allActionsSubmitted',
    args: gameId ? [BigInt(gameId)] : undefined,
    query: { enabled: !!gameId, refetchInterval: 3000 },
  });

  return { allSubmitted: data, isLoading, error, refetch };
}

import { useReadContract } from 'wagmi';
import { PLUNDRIX_ABI, PLUNDRIX_ADDRESS } from '../config/contract';

export function useTotalGames() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    functionName: 'totalGames',
    query: { refetchInterval: 10000 },
  });

  return { totalGames: data, isLoading, error, refetch };
}

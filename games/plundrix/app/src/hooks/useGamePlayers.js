import { useReadContracts } from 'wagmi';
import { PLUNDRIX_ABI, PLUNDRIX_ADDRESS } from '../config/contract';

export function useGamePlayers(gameId, playerCount) {
  const count = Number(playerCount || 0);

  const contracts = Array.from({ length: count }, (_, i) => ({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    functionName: 'getPlayerAddress',
    args: [BigInt(gameId), BigInt(i + 1)],
  }));

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: { enabled: count > 0 && !!gameId },
  });

  const players = data?.map((r) => r.result).filter(Boolean) || [];

  return { players, isLoading, error, refetch };
}

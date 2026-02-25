import { useReadContract } from 'wagmi';
import { PLUNDRIX_ABI, PLUNDRIX_ADDRESS } from '../config/contract';
import { keccak256, toHex } from 'viem';

const GAME_MASTER_ROLE = keccak256(toHex('GAME_MASTER_ROLE'));

export function useHasRole(address) {
  const { data, isLoading, error } = useReadContract({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    functionName: 'hasRole',
    args: address ? [GAME_MASTER_ROLE, address] : undefined,
    query: { enabled: !!address },
  });

  return { hasRole: !!data, isLoading, error };
}

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PLUNDRIX_ABI, PLUNDRIX_ADDRESS } from '../config/contract';

export function useGameActions() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createGame = () =>
    writeContractAsync({
      address: PLUNDRIX_ADDRESS,
      abi: PLUNDRIX_ABI,
      functionName: 'createGame',
    });

  const registerPlayer = (gameId) =>
    writeContractAsync({
      address: PLUNDRIX_ADDRESS,
      abi: PLUNDRIX_ABI,
      functionName: 'registerPlayer',
      args: [BigInt(gameId)],
    });

  const startGame = (gameId) =>
    writeContractAsync({
      address: PLUNDRIX_ADDRESS,
      abi: PLUNDRIX_ABI,
      functionName: 'startGame',
      args: [BigInt(gameId)],
    });

  const submitAction = (gameId, action, sabotageTarget = '0x0000000000000000000000000000000000000000') =>
    writeContractAsync({
      address: PLUNDRIX_ADDRESS,
      abi: PLUNDRIX_ABI,
      functionName: 'submitAction',
      args: [BigInt(gameId), action, sabotageTarget],
    });

  const resolveRound = (gameId) =>
    writeContractAsync({
      address: PLUNDRIX_ADDRESS,
      abi: PLUNDRIX_ABI,
      functionName: 'resolveRound',
      args: [BigInt(gameId)],
    });

  return {
    createGame,
    registerPlayer,
    startGame,
    submitAction,
    resolveRound,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

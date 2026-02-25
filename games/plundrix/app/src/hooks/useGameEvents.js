import { useState, useCallback, useRef } from 'react';
import { useWatchContractEvent } from 'wagmi';
import { PLUNDRIX_ABI, PLUNDRIX_ADDRESS } from '../config/contract';

export function useGameEvents(gameId) {
  const [events, setEvents] = useState([]);
  const [latestRoundEvents, setLatestRoundEvents] = useState(null);
  const eventsRef = useRef([]);

  const addEvent = useCallback((name, log) => {
    const gameIDFromLog = log.args?.gameID;
    if (gameId && gameIDFromLog !== undefined && BigInt(gameId) !== gameIDFromLog) return;

    const entry = {
      name,
      args: log.args,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
      timestamp: Date.now(),
    };

    setEvents((prev) => {
      const next = [...prev, entry];
      eventsRef.current = next;
      return next;
    });
  }, [gameId]);

  const collectRoundEvents = useCallback((blockNumber) => {
    // Use ref to get the latest events including those added in the same block
    setTimeout(() => {
      const current = eventsRef.current;
      const roundBatch = current.filter((e) => e.blockNumber === blockNumber);
      setLatestRoundEvents(roundBatch);
    }, 50);
  }, []);

  useWatchContractEvent({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    eventName: 'GameCreated',
    onLogs: (logs) => logs.forEach((l) => addEvent('GameCreated', l)),
    enabled: !!gameId,
  });

  useWatchContractEvent({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    eventName: 'PlayerJoined',
    onLogs: (logs) => logs.forEach((l) => addEvent('PlayerJoined', l)),
    enabled: !!gameId,
  });

  useWatchContractEvent({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    eventName: 'GameStarted',
    onLogs: (logs) => logs.forEach((l) => addEvent('GameStarted', l)),
    enabled: !!gameId,
  });

  useWatchContractEvent({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    eventName: 'ActionSubmitted',
    onLogs: (logs) => logs.forEach((l) => addEvent('ActionSubmitted', l)),
    enabled: !!gameId,
  });

  useWatchContractEvent({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    eventName: 'RoundResolved',
    onLogs: (logs) => {
      logs.forEach((l) => addEvent('RoundResolved', l));
      if (logs[0]?.blockNumber !== undefined) {
        collectRoundEvents(logs[0].blockNumber);
      }
    },
    enabled: !!gameId,
  });

  useWatchContractEvent({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    eventName: 'LockCracked',
    onLogs: (logs) => logs.forEach((l) => addEvent('LockCracked', l)),
    enabled: !!gameId,
  });

  useWatchContractEvent({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    eventName: 'ToolFound',
    onLogs: (logs) => logs.forEach((l) => addEvent('ToolFound', l)),
    enabled: !!gameId,
  });

  useWatchContractEvent({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    eventName: 'PlayerSabotaged',
    onLogs: (logs) => logs.forEach((l) => addEvent('PlayerSabotaged', l)),
    enabled: !!gameId,
  });

  useWatchContractEvent({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    eventName: 'PlayerStunned',
    onLogs: (logs) => logs.forEach((l) => addEvent('PlayerStunned', l)),
    enabled: !!gameId,
  });

  useWatchContractEvent({
    address: PLUNDRIX_ADDRESS,
    abi: PLUNDRIX_ABI,
    eventName: 'GameWon',
    onLogs: (logs) => logs.forEach((l) => addEvent('GameWon', l)),
    enabled: !!gameId,
  });

  const clearEvents = useCallback(() => {
    setEvents([]);
    eventsRef.current = [];
  }, []);

  return { events, latestRoundEvents, clearEvents };
}

import { Action } from '../../lib/constants';
import { useGameActions } from '../../hooks/useGameActions';
import TxStatus from '../shared/TxStatus';
import PickControl from './PickControl';
import SearchControl from './SearchControl';
import SabotageControl from './SabotageControl';

export default function ActionPanel({
  gameId,
  stunned,
  actionSubmitted,
  tools,
  players,
  currentAddress,
}) {
  const { submitAction, hash, isPending, isConfirming, isSuccess, error } = useGameActions();

  const disabled = actionSubmitted || isPending || isConfirming;

  const handlePick = () => {
    submitAction(gameId, Action.PICK);
  };

  const handleSearch = () => {
    submitAction(gameId, Action.SEARCH);
  };

  const handleSabotage = (targetAddress) => {
    submitAction(gameId, Action.SABOTAGE, targetAddress);
  };

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-xs tracking-[0.35em] text-vault-text-dim uppercase font-display">
          Action Console
        </h3>
        {actionSubmitted && (
          <span className="font-mono text-[9px] text-blueprint uppercase tracking-wider border border-blueprint/30 rounded px-2 py-0.5 bg-blueprint/5">
            Submitted
          </span>
        )}
      </div>

      {/* 3-column action controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <PickControl
          onSubmit={handlePick}
          disabled={disabled}
          stunned={stunned}
          tools={tools}
        />
        <SearchControl
          onSubmit={handleSearch}
          disabled={disabled}
          stunned={stunned}
          tools={tools}
        />
        <SabotageControl
          onSubmit={handleSabotage}
          disabled={disabled}
          stunned={stunned}
          players={players}
          currentAddress={currentAddress}
        />
      </div>

      {/* Transaction status */}
      <TxStatus
        hash={hash}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error}
      />
    </div>
  );
}

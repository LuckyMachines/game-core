export function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatBigInt(value) {
  if (value === undefined || value === null) return '0';
  return Number(value).toString();
}

export function formatTimeRemaining(roundStartTime, timeout = 300) {
  if (!roundStartTime) return '--:--';
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - Number(roundStartTime);
  const remaining = Math.max(0, timeout - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function pickChance(tools, stunned) {
  if (stunned) return 0;
  return Math.min(40 + Number(tools) * 15, 95);
}

export function searchChance(stunned) {
  return stunned ? 30 : 60;
}

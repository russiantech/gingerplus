/** 3×3 dot grid ("apps") icon — soft, rounded, inherits currentColor. */
export default function DotsIcon({ size = 20 }: { size?: number }) {
  const d = [4, 12, 20];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      {d.flatMap((y) => d.map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" />))}
    </svg>
  );
}

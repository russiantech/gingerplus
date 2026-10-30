/** Southern Rose badge (real logo) + wordmark. Sizes the badge; the wordmark is live text so it stays crisp and themes with dark mode. */
export default function BrandLogo({ size = 40, text = true, className = "" }: { size?: number; text?: boolean; className?: string }) {
  return (
    <span className={`brand-logo ${className}`}>
      <img src="/images/brand/logo-badge.png" srcSet="/images/brand/badge-64.png 1x, /images/brand/badge-192.png 3x" alt={text ? "" : "Southern Rose Ginger Plus"} width={size} height={size} style={{ width: size, height: size }} />
      {text && <span className="brand-words"><b>Southern Rose</b><small>GINGER PLUS</small></span>}
    </span>
  );
}

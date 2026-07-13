/**
 * PublicPageBackground
 *
 * Single-source background system for all public HAQJobs marketing pages.
 * Exactly mirrors the visual atmosphere of the Homepage Hero:
 *
 *   • #0B0B0B base
 *   • white grid lines at 80px — opacity 3%
 *   • dual orange radial glows (right-centre + bottom-left)
 *   • bottom-edge dark vignette
 *   • SVG fractal noise overlay at 40% mix-blend-overlay
 *
 * Usage — wrap any public page root:
 *
 *   <PublicPageBackground>
 *     <YourPageContent />
 *   </PublicPageBackground>
 *
 * The component is a simple server component (no "use client" needed).
 * Children are rendered on top of the fixed background layers at z-10.
 */

export default function PublicPageBackground({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative min-h-screen w-full bg-[#0B0B0B] overflow-x-hidden ${className}`}
    >
      {/* ── Grid lines ── identical to HeroSection ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.03,
        }}
      />

      {/* ── Ambient orange radial glows ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 80% 30%, rgba(217,72,15,0.06) 0%, transparent 70%), " +
            "radial-gradient(ellipse 40% 60% at 20% 80%, rgba(217,72,15,0.035) 0%, transparent 60%)",
        }}
      />

      {/* ── Bottom vignette ── */}
      <div
        className="fixed inset-x-0 bottom-0 h-64 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, rgba(11,11,11,0.7) 0%, transparent 100%)",
        }}
      />

      {/* ── Noise overlay ── */}
      <div
        className="noise-overlay fixed inset-0 opacity-40 mix-blend-overlay pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* ── Page content ── */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

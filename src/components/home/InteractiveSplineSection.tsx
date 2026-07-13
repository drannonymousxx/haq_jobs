"use client";

import { useEffect, useState } from "react";

/**
 * InteractiveSplineSection
 *
 * Renders the Spline animation via the official iframe embed.
 * Uses a mounted-state guard so the iframe is only injected on the
 * client, preventing any SSR / hydration mismatch.
 *
 * No @splinetool/react-spline, no @splinetool/runtime,
 * no hana-viewer, no script injection, no dangerouslySetInnerHTML.
 */
export default function InteractiveSplineSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      aria-label="HAQJobs Interactive Experience"
      style={{
        width: "100%",
        background: "#0B0B0B",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        /* Responsive height via CSS custom properties */
        height: "var(--spline-section-height, 900px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Responsive height tokens injected once via a style tag */}
      <style>{`
        :root {
          --spline-section-height: 900px;
        }
        @media (max-width: 1024px) {
          :root { --spline-section-height: 800px; }
        }
        @media (max-width: 768px) {
          :root { --spline-section-height: 650px; }
        }
        @media (max-width: 480px) {
          :root { --spline-section-height: 500px; }
        }
      `}</style>

      {mounted && (
        <iframe
          src="https://my.spline.design/autolayoutlistcopycopy-wzbZDBh6rE75UOO5f81hFMQz-DVj/"
          title="HAQJobs Interactive Experience"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            overflow: "hidden",
            background: "transparent",
            display: "block",
            pointerEvents: "auto",
          }}
        />
      )}
    </section>
  );
}

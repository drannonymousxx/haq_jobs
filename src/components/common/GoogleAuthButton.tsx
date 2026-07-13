"use client";

/**
 * GoogleAuthButton
 *
 * Reusable Google OAuth button for the HAQJobs authentication flow.
 * Uses the official multicolor Google "G" from react-icons/fc (FcGoogle).
 *
 * Props:
 *   label    — button text  (e.g. "Sign in with Google" / "Sign up with Google")
 *   onClick  — async handler provided by the parent auth page
 *   disabled — mirrors the page-level loading state
 */

import { FcGoogle } from "react-icons/fc";

interface GoogleAuthButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function GoogleAuthButton({
  label,
  onClick,
  disabled = false,
}: GoogleAuthButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-brand-card border border-brand-border rounded-xl hover:bg-brand-bg transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FcGoogle className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span className="text-sm font-semibold text-brand-text-secondary">
        {label}
      </span>
    </button>
  );
}

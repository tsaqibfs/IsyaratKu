# Core demo UX implementation plan

> For agentic workers: execute inline with superpowers:executing-plans. User approved all four main priorities on 7 November 2026.

Goal: clarify the camera workflow and help users recover from recognition errors without changing the trained classifier.

Architecture: extend the existing camera controller with a cancellable three-second countdown. Keep the worker protocol and ML assets unchanged. Use the shared editor state for a native modal large-text view and focus the editor for manual corrections.

Tech stack: existing React, TypeScript, CSS, Vitest and Playwright. No new dependencies.

Design approved scope: three-step visible guide; countdown with timer and truthful hand visibility; retry and manual correction; large-text view with keyboard dismissal. Existing confirmation, privacy, stale-result guards, camera shutdown and model version checks remain required. No TTS, top-three candidates, retraining, proposal edits or deployment in this change.

Work in the current checkout on codex/improve-core-demo-ux; user requested concrete edits to the existing app. Preserve previous branch and all unrelated files.

## Tasks

- [x] Add behavioral tests and confirm failure for delayed BEGIN, cancellation, stop, rejected-candidate correction, and editor large-text display.
- [x] Extend src/features/camera/useRecognition.ts: countdown phase, timer cleanup, elapsed recording time, result dismissal. Never BEGIN after cancellation, stop or stale session.
- [x] Update RecognitionPanel.tsx: ordered guide, timer overlay, hand count, progress and recovery actions. Detection is not a claim of correct signing.
- [x] Update App.tsx and styles.css: focus editor for correction and native large-text dialog. Preserve typed text, close with Escape or button, restore opener focus. Explicit boundary focus wrapping supplements native modality.
- [x] Run npm run check and Playwright. Check countdown lifecycle, no-hand rejection with real worker, keyboard focus and overflow at 375px, large-text wrapping, model parity and local processing.
- [x] Inspect desktop/mobile screenshots, review diff, and record results. No push or deployment.

## Verification and decisions

User steering: ordinary Indonesian throughout the product. Removed classifier scores and technical terms from visible copy; retained plain-language limitations and privacy explanation.

Four new feature tests failed before implementation. Added a fifth regression for the minimum capture span; it failed before the fix, then passed. Final npm run check passed: lint, 5 packaging tests, 18 unit tests, typecheck and production build. All 8 Chrome tests passed, covering unchanged real-model parity, synthetic camera rejection/privacy/lifecycle, countdown cancellation, large-text focus and Escape, mobile wrapping, and keyboard operation. Webcam quality on human signers remains outside these tests.

Browser inspection found Chrome could move focus to body when tabbing through the native modal; explicit first/last wrapping and a keyboard-focusable scroll area resolved it. Read-only final review identified premature finish eligibility; eligibility now uses >=15 acknowledged samples spanning >=1000ms, while the visible timer uses wall time. Reviewer verified both fixes and found no additional actionable issues.

Desktop, countdown and mobile views were visually inspected. Model weights, preprocessing and worker protocol were not modified. Existing proposal remains separate and has not been edited by this change.

## Review focus

Stop/cancel/hidden/unmount must invalidate countdown callbacks; recording timer must work without hands; rejected candidates must never be auto-added; large view must not lose text; mobile controls must remain reachable with long messages.

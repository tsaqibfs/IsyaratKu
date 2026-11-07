# Speech and searchable vocabulary implementation plan

> For agentic workers: execute inline using superpowers:executing-plans. User approved the previously proposed additional priorities on 8 November 2026.

Goal: read reviewed editor messages aloud on demand and make the active vocabulary searchable without camera access.

Architecture: browser speech component owns its utterance lifecycle and uses only local Indonesian voices. A separate vocabulary guide reads labels from the active tracked browser-model package at build time. Neither selecting a word nor opening the guide changes classifier input or output.

Tech stack: existing React, TypeScript, CSS, Vitest and Playwright; no dependencies or new training data.

Approved design: a Bacakan pesan button toggles to Hentikan suara. No automatic speech. Editing/clearing text, hiding/unloading the page, or unmounting cancels speech. Missing local Indonesian voice or unsupported APIs leave the editor usable and explain availability in ordinary Indonesian. A separate guide shows all 31 active labels, case-insensitive search, clear/no-results states, selected-word guidance and an explicit external Kamus SIBI link. Selecting a guide word never fills the editor or biases recognition. No sign clips, remote speech fallback, microphone, model changes, top-three predictions, proposal edits or publishing.

Work in place on codex/add-speech-and-word-guide, based on the clean core-UX branch. Preserve all unrelated files.

## Tasks

- [x] Add tests for explicit-only local Indonesian speech; late voices, unsupported/remote-only voice lists, stale events, editing and visibility/unmount cancellation; camera-independent vocabulary search and guidance.
- [x] Confirm new tests fail before implementation.
- [x] Add SpeechControls.tsx and VocabularyGuide.tsx; load active labels through src/data/vocabulary.ts. Integrate into App.tsx and replace duplicate camera vocabulary list with a guide link.
- [x] Add responsive styles and plain-language product copy.
- [x] Run npm run check and Chrome tests, including browser speech API wiring with controlled voices and actual-browser voice availability check.
- [x] Inspect desktop/mobile views and review final changes. Keep work on the feature branch with a conventional local commit; no push or deployment.

## Verification evidence (8 November 2026)

`npm run check` passed: lint, five deployment-package checks, 26 unit tests, TypeScript and production build. `npx playwright test` passed all 11 Chrome tests. Desktop and 375px vocabulary views were visually inspected; mobile overflow and clear-search keyboard focus passed. A fresh read-only review found an incomplete speech test fixture; the fixture was corrected and the full Chrome suite passed afterward.

The actual Chrome environment supports speech synthesis but exposes zero local Indonesian voices. The product correctly disables speech and explains availability while leaving the editor usable. Controlled voice tests verify selection, cancellation and absence of outbound requests; audible speech on a device with an Indonesian voice remains a manual acceptance check. No recognition accuracy or new human-user validation is claimed.

## Review focus

No remote/English fallback; repeated clicks do not queue speech; late callbacks cannot stop a newer utterance; clear/edit/navigation stops current speech; vocabulary is independent of camera; guide selections never masquerade as recognition; narrow screens and keyboard controls remain usable. Controlled speech tests prove API wiring, not audible output quality.

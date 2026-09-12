# From reproduction to a test

Use this mode when a durable browser regression test is requested or justified by a non-trivial bug. CLI action output can supply Playwright locators; it does not supply the assertions that establish correctness.

Reproduce the smallest affected flow, then use `recording-start` / `recording-stop` in the owned session when collecting a longer sequence. Prefer observed role/name locators to snapshot refs such as `e7`, which are specific to that browser snapshot.

Before writing a test, inspect the repository's runner, fixtures, and test locations. Reuse its infrastructure rather than adding `@playwright/test`, a new test runner, or browser-launch code solely because the CLI emitted Playwright syntax. A source-level test may establish the bug more reliably than remote peer content.

Add assertions for the visible outcome and relevant failure case. Keep fixtures deterministic and avoid publishing real posts or relying on mutable community data unless explicitly required. Persist only the code/evidence needed for the test; session commands still use the wrapper and exact cleanup.

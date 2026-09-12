---
name: context7
description: Retrieve library documentation with Context7 when the current task needs version-specific API guidance or a concrete documentation lookup.
---

# Context7

Use the installed dependency version and the API question to scope the lookup. Existing source and tests may already answer it; a normal coding task does not require a Context7 search merely because it uses a library.

Use an available Context7 tool, or read [HTTP lookup](references/http-lookup.md) when calling the API directly. Select the matching library and version from the results; do not assume the first result or latest release matches this repository.

Fetch only documentation relevant to the decision. Check returned examples against the installed API and link the underlying official documentation when reporting a claim. If Context7 is unavailable, use official docs or installed source instead of installing another integration or blocking unrelated work.

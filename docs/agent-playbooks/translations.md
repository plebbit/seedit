# Translations Workflow

Locales live in `public/translations/{lang}/default.json`. Use the `translate` skill and `scripts/update-translations.js`; do not rewrite individual locale files by hand.

## Add or update

Create one task-specific temporary map per key, containing every supported language including English. Preserve placeholders, markup, technical terms, and brand names. Discover the supported language directories instead of hard-coding a count.

Translation generation can run in parallel. Only the parent/writer applies the resulting maps, serially:

```bash
node scripts/update-translations.js --key my_new_key --map /tmp/task-key-map.json --include-en --dry
node scripts/update-translations.js --key my_new_key --map /tmp/task-key-map.json --include-en --write
```

Review the dry run and validate the final key/language coverage. Delete only the temporary maps created for this task. A translator child generates its assigned map and returns it; it never invokes a locale write.

## Concurrency and recovery

Every non-dry write mode takes `public/translations/.update-translations.lock` before reading files. A competing writer fails without writing; retry after the owner finishes so it reads fresh state. Each locale file is replaced atomically, but a multi-language operation is not a transaction across all files; inspect results after an interrupted write and safely rerun the intended operation.

Normal success/failure releases the owned lock. A terminated process may leave a lock behind. The lock file has no owner metadata: inspect running translation commands and open file handles to confirm no writer is active before removing that exact stale lock. Never remove a live or unknown lock and never commit lock or temporary files. Dry runs acquire no lock and change no files.

## Other operations

```bash
# Technical term, brand, or placeholder fallback only
node scripts/update-translations.js --key some_key --from en --dry
node scripts/update-translations.js --key some_key --from en --write

# Authorized key removal
node scripts/update-translations.js --key obsolete_key --delete --dry
node scripts/update-translations.js --key obsolete_key --delete --write

# Inspect unused keys before an authorized removal
node scripts/update-translations.js --audit --dry
node scripts/update-translations.js --audit --write
```

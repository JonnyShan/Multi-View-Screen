#!/usr/bin/env bash
# Publishes the single page (pnpm build:artifact) to the public Cloudflare Pages site.
# The page lives in a KV namespace bound to the Pages project as SITE, and tools/pages-worker.js
# serves it (Pages' own file upload is not used, so only an API token with Pages Edit and
# Workers KV Storage Edit is needed).
# usage: CF_ACCOUNT=<account id> CF_KV=<namespace id> [CF_TOKEN=<token>] tools/publish-pages.sh [--worker]
#   --worker also redeploys tools/pages-worker.js (only needed when that file changes)
set -euo pipefail
cd "$(dirname "$0")/.."
: "${CF_ACCOUNT:?set CF_ACCOUNT}" "${CF_KV:?set CF_KV}"
API="https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT"
AUTH=()
if [ -n "${CF_TOKEN:-}" ]; then AUTH=(-H "Authorization: Bearer $CF_TOKEN"); fi
PAGE=dist-artifact/night-contracts.html
[ -f "$PAGE" ] || { echo "run pnpm build:artifact first"; exit 1; }
curl -fsS "${AUTH[@]}" -X PUT "$API/storage/kv/namespaces/$CF_KV/values/index.html" -F "value=@$PAGE;type=text/html" >/dev/null
echo "page uploaded"
if [ "${1:-}" = "--worker" ]; then
  curl -fsS "${AUTH[@]}" -X POST "$API/pages/projects/night-contracts/deployments" \
    -F 'manifest={}' -F 'branch=main' -F "_worker.js=@tools/pages-worker.js;type=application/javascript+module" >/dev/null
  echo "worker deployed"
fi
echo "live at https://night-contracts.pages.dev (about a minute for caches to catch up)"

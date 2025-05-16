#!/bin/bash
set -e

if [ -n "$FILEBASE_KEY" ] && [ "$FILEBASE_KEY" != "undefined" ]; then
  npx solana-suite-config -c prd
  npx solana-suite-config -f "$FILEBASE_KEY" "$FILEBASE_SECRET" "$FILEBASE_BUCKET"
  npx solana-suite-config -d true
  #  solana-clusterのurlに solana rpc url を設定
  npx solana-suite-config -cc "$SOLANA_RPC_URL"
  npx solana-suite-config -das "$SOLANA_DAS_URL"
  npx solana-suite-config -s
else
  echo "FILEBASE_KEY is undefined."
fi

exec "$@"

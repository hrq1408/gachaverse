#!/usr/bin/env bash
set -euo pipefail
shopt -s extglob
case "$1" in
  gachaverse)
    directory=out
    if compgen -G 'out/_next/static/chunks/webpack-*.js' > /dev/null; then
      echo "::error::O portal no Pages deve ser gerado com Turbopack."
      exit 1
    fi
    ;;
  gachaverse-tracker) directory=tracker-out ;;
  *) exit 2 ;;
esac
for key in CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN; do
  value=${!key}
  value=${value##+([[:space:]])}
  value=${value%%+([[:space:]])}
  if [[ -z $value || $value == *[!a-zA-Z0-9_-]* ]]; then
    echo "::error::Formato inválido para o secret $key."
    exit 1
  fi
  export "$key=$value"
done
[[ $CLOUDFLARE_ACCOUNT_ID =~ ^[[:xdigit:]]{32}$ ]]
npx --yes wrangler@4.168.0 pages deploy "$directory" --project-name "$1" --branch main --commit-hash "$GITHUB_SHA"

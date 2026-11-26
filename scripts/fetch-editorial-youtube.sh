#!/usr/bin/env bash
set -euo pipefail

repo=hrq1408/gachaverse
destination="${1:?Informe um diretório temporário}"
if [[ -z "${GH_TOKEN:-}" ]]; then
  echo 'Snapshot do YouTube indisponível sem acesso de leitura ao repositório produtor.'
  exit 0
fi

runs=$(gh api -X GET "repos/$repo/actions/workflows/codigos.yml/runs" \
  -f branch=main -f status=success -f per_page=5 \
  --jq '.workflow_runs[] | select(.head_repository.full_name == "hrq1408/gachaverse" and .head_branch == "main") | .id')
for run in $runs; do
  id=$(gh api "repos/$repo/actions/runs/$run/artifacts?name=youtube-publico" \
    --jq '.artifacts[] | select(.name == "youtube-publico" and .expired == false) | .id')
  if [[ "$id" =~ ^[0-9]+$ ]]; then
    gh run download "$run" --repo "$repo" --name youtube-publico --dir "$destination"
    exit 0
  fi
done
echo 'Nenhum snapshot recente do produtor encontrado.'

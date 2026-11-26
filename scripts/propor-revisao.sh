#!/usr/bin/env bash
set -euo pipefail
file=docs/propostas/codigos.json
branch=automacao/revisao-codigos
generated="$RUNNER_TEMP/codigos.json"
[[ -s "$generated" ]] || { echo 'Nenhuma proposta nova.'; exit 0; }
if [[ -f "$file" ]] && cmp -s "$generated" "$file"; then exit 0; fi
existing=$(gh pr list --state open --head "$branch" --base main --json number --jq '.[0].number // empty')
if git ls-remote --exit-code --heads origin "$branch" >/dev/null; then
  git fetch --no-tags origin "$branch"
  git switch --detach FETCH_HEAD
else
  git switch --detach "origin/main"
fi
mkdir -p "$(dirname "$file")"
cp "$generated" "$file"
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -- "$file"
if ! git diff --cached --quiet; then
  git commit -m "Propõe revisão editorial de códigos"
  git push origin "HEAD:refs/heads/$branch"
fi
if [[ -z "$existing" ]]; then
  gh pr create --draft --base main --head "$branch" --title "Revisão editorial de códigos de resgate" \
    --body "Conferir as fontes e os prazos da proposta antes de alterar content/resgates/catalogo.json. Este PR só contém candidatos. Nenhum registro foi publicado ou teve sua data de conferência atualizada."
fi

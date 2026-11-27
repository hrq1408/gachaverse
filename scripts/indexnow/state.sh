#!/usr/bin/env bash
set -euo pipefail

ref=refs/heads/indexnow-state
state=$(mktemp)
next=$(mktemp)
trap 'rm -f "$state" "$next"' EXIT
printf '{"version":1,"retryAt":0,"received":{}}\n' > "$state"
parent=
if git ls-remote --exit-code origin "$ref" >/dev/null; then
  git fetch --no-tags origin "$ref"
  parent=$(git rev-parse FETCH_HEAD)
  git show "$parent:state.json" > "$state"
else
  status=$?
  if [[ $status != 2 ]]; then exit "$status"; fi
fi

node scripts/indexnow/run.mjs notify "$state" "$next"
if [[ ! -s $next ]] || cmp -s "$state" "$next"; then exit 0; fi
blob=$(git hash-object -w "$next")
tree=$(printf '100644 blob %s\tstate.json\n' "$blob" | git mktree)
args=()
if [[ -n $parent ]]; then args=(-p "$parent"); fi
commit=$(git -c user.name='github-actions[bot]' \
  -c user.email='41898282+github-actions[bot]@users.noreply.github.com' \
  commit-tree "$tree" "${args[@]}" -m 'Registra notificações IndexNow')
git push origin "$commit:$ref"

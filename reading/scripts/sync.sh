#!/usr/bin/env bash
set -euo pipefail
cd /opt/space-blog/app
export PATH="/opt/space-blog/toolchain/node-v24.19.0-linux-x64/bin:$PATH"
export HOME=/opt/space-blog/home
export SPACE_BLOG_SOURCE=https://beautyclaw.cn SPACE_BLOG_SPACE=blog
export NODE_OPTIONS=--max-old-space-size=512
unset SPACE_BLOG_FIXTURE
exec 9>/var/www/beautyclaw-blog/sync.lock
flock -n 9 || exit 0
web=/var/www/beautyclaw-blog
retire() {
  rm -f "$web/current.next"
  ln -s /opt/space-blog/unavailable "$web/current.next"
  mv -Tf "$web/current.next" "$web/current"
}
if node scripts/probe.mjs --manifest > "$web/probe.json"; then
  fingerprint=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("/var/www/beautyclaw-blog/probe.json")).fingerprint)')
  current=$(node -e 'try { console.log(JSON.parse(require("fs").readFileSync("/var/www/beautyclaw-blog/current/blog-source.json")).fingerprint) } catch {}')
  [[ "$fingerprint" == "$current" && ! -f "$web/force-build" ]] && exit 0
else
  status=$?
  [[ $status -eq 4 ]] && retire
  exit "$status"
fi
# Ordinary additions/edits keep the last complete site until atomic replacement.
# Remove withdrawn resources and discovery before the full build, keeping other pages available.
if ! node -e 'try {const fs=require("fs"), old=JSON.parse(fs.readFileSync("/var/www/beautyclaw-blog/current/blog-source.json")), next=new Set(JSON.parse(fs.readFileSync("/var/www/beautyclaw-blog/probe.json")).paths); if(!old.paths || old.paths.some(path=>!next.has(path))) process.exit(1)} catch {process.exit(1)}'; then
  if [[ -f "$web/current/blog-source.json" ]]; then
    pruned="$web/builds/pruned-$(date -u +%Y%m%dT%H%M%S)-${fingerprint:0:12}"
    if ! node scripts/prune-withdrawn.mjs "$web/current" "$pruned" "$web/probe.json"; then
      rm -rf "$pruned"
      retire
      exit 1
    fi
    if ! current_visibility=$(node scripts/probe.mjs) || [[ "$current_visibility" != "$fingerprint" ]]; then
      rm -rf "$pruned"
      retire
      exit 1
    fi
    ln -s "$pruned" "$web/current.next"
    mv -Tf "$web/current.next" "$web/current"
    find "$web/builds" -mindepth 1 -maxdepth 1 -type d ! -path "$pruned" -exec rm -rf -- {} +
  else
    # Bootstrap, or recover after the anonymous site was unavailable.
    retire
  fi
fi
rm -rf dist .astro public/media public/pagefind public/blog-source.json
corepack pnpm@11.10.0 run build
node -e 'const x=JSON.parse(require("fs").readFileSync("dist/blog-source.json")); if(x.mode!=="reader") process.exit(1)'
after=$(node scripts/probe.mjs)
built=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("dist/blog-source.json")).fingerprint)')
[[ "$after" == "$built" ]] || { echo 'Publication changed before deploy; next timer will rebuild' >&2; exit 1; }
target="$web/builds/$(date -u +%Y%m%dT%H%M%S)-${built:0:12}"
mv dist "$target"
ln -s "$target" "$web/current.next"
mv -Tf "$web/current.next" "$web/current"
find "$web/builds" -mindepth 1 -maxdepth 1 -type d ! -path "$target" -exec rm -rf -- {} +
rm -f "$web/force-build"
echo "Published $built to $target"

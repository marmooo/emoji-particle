mkdir -p docs
cp -r src/* docs
drop-inline-css -r src -o docs
deno bundle emoji-particle.ts > src/emoji-particle.js
minify -r docs -o .

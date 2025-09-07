mkdir -p docs
cp -r src/* docs
drop-inline-css -r src -o docs
deno bundle src/emoji-particle.js > docs/emoji-particle.js
minify -r docs -o .

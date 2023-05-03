#!/bin/bash
set -vx

echo reset of the changes in this directory to the last commit

# reset *.html *-css and *.js to the last commit (but only these files, nothing else and nothing outside of this directory

for fil in *.html *.css *.js; do
  git restore --staged $fil
  git restore $fil
done

/bin/rm -f *.orig

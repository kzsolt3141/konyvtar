#!/bin/bash

git checkout .
git pull

rm entrypoint

npm install

pkg entrypoint.js -t node18-linux-arm64

chmod +x entrypoint

./entrypoint


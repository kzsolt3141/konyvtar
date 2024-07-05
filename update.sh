#!/bin/bash

git checkout .
git pull

npm install

node entrypoint.js
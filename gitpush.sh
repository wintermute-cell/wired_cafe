#!/usr/bin/env bash

git add .; git commit -m"$1"; git push
cd frontend
git add .; git commit -m"$1"; git push
cd ../backend
git add .; git commit -m"$1"; git push

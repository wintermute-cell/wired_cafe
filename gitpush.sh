#!/usr/bin/env bash

cd frontend
git add .; git commit -m"$1"; git push
cd ../backend
git add .; git commit -m"$1"; git push
cd ..
git add .; git commit -m"$1"; git push

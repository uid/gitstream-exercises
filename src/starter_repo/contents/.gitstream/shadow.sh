#!/bin/bash

tree=$(git write-tree)
commit=$(git commit-tree -m "shadowcommit" $tree)
git update-ref refs/heads/shadowbranch $commit
git push -fq origin refs/heads/shadowbranch
git update-ref -d refs/heads/shadowbranch
git update-ref -d refs/remotes/origin/shadowbranch

# tiangong-cli

personal cli

统计代码行数的逻辑
git log --author="Alfred-Lau" --pretty=tformat: --numstat | awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "added lines: %s, removed lines: %s, total lines: %s\n", add, subs, loc }' -

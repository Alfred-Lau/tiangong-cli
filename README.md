# tiangong-cli

> 概述
 作为天工体系贯穿始终的工具基座，采用擦肩式开发架构，CS 架构

## 提供能力

### 项目管理
### git 管理能力
### 本地 & 服务端构建发布能力
### 其他

![ss](https://lazy-minus-your-intelligence.oss-cn-qingdao.aliyuncs.com/articles_assets/%E5%A4%A9%E5%B7%A5%E4%BD%93%E7%B3%BB%E5%85%A8%E5%9F%9F%E6%8A%80%E6%9C%AF%E6%9E%B6%E6%9E%84%E5%9B%BE.png)

统计代码行数的逻辑
git log --author="Alfred-Lau" --pretty=tformat: --numstat | awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "added lines: %s, removed lines: %s, total lines: %s\n", add, subs, loc }' -

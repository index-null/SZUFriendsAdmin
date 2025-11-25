#!/bin/bash
# 自定义 CodeBuddy CN 启动脚本
# 用于 vite-plugin-vue-inspector

# 接收 3 个参数: filename, line, column
filename=$1
line=$2
column=$3

buddycn -g "$filename:$line:$column"

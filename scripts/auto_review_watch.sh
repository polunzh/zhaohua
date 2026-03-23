#!/bin/zsh

set -euo pipefail

ROOT_DIR="/Users/zhenqiang/Documents/code/zhaohua"
REVIEW_FILE="$ROOT_DIR/review.md"
SPEC_FILE="$ROOT_DIR/docs/specs/2026-03-23-zhaohua-design.md"
STATE_DIR="$ROOT_DIR/.review-watch"
PID_FILE="$STATE_DIR/watcher.pid"
PREV_FILE="$STATE_DIR/review.prev.md"
PROMPT_FILE="$STATE_DIR/review.prompt.txt"
OUTPUT_FILE="$STATE_DIR/last-codex-output.txt"
LOG_FILE="$STATE_DIR/watcher.log"
INTERVAL_SECONDS=30

mkdir -p "$STATE_DIR"

if [[ -f "$PID_FILE" ]]; then
  existing_pid="$(cat "$PID_FILE")"
  if [[ -n "$existing_pid" ]] && kill -0 "$existing_pid" 2>/dev/null; then
    echo "Watcher already running with PID $existing_pid"
    exit 0
  fi
fi

echo "$$" > "$PID_FILE"
trap 'rm -f "$PID_FILE"' EXIT

if [[ ! -f "$REVIEW_FILE" ]]; then
  touch "$REVIEW_FILE"
fi

if [[ ! -f "$SPEC_FILE" ]]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Missing spec file: $SPEC_FILE" >> "$LOG_FILE"
  exit 1
fi

cp "$REVIEW_FILE" "$PREV_FILE"
last_hash="$(shasum -a 256 "$REVIEW_FILE" | awk '{print $1}')"

echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Auto review watcher started. PID=$$" >> "$LOG_FILE"

while true; do
  sleep "$INTERVAL_SECONDS"

  current_hash="$(shasum -a 256 "$REVIEW_FILE" | awk '{print $1}')"
  if [[ "$current_hash" == "$last_hash" ]]; then
    continue
  fi

  cat > "$PROMPT_FILE" <<EOF
你在仓库根目录工作。

请对比下面两个文件的差异：
- 旧快照：$PREV_FILE
- 当前文件：$REVIEW_FILE

任务：
1. 判断这次改动里，是否包含“针对某个已有 Review 版本的改进、回应、修正、补充或已处理说明”。
2. 如果没有，不要修改任何文件，只在最终输出中写一行：NO_ACTION
3. 如果有，重新 review：$SPEC_FILE
4. 把新的评审结果追加写入：$REVIEW_FILE
5. 只能追加，不能覆盖已有内容
6. 新结果必须使用递增版本号，格式为：## Review vN
7. 使用中文
8. 重点关注：旧问题是否已被修正、是否引入新问题、还缺什么约束
EOF

  echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] review.md changed, invoking codex" >> "$LOG_FILE"

  if codex -a never -s workspace-write exec \
    --skip-git-repo-check \
    -C "$ROOT_DIR" \
    -o "$OUTPUT_FILE" \
    --color never \
    - < "$PROMPT_FILE" >> "$LOG_FILE" 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] codex run completed" >> "$LOG_FILE"
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] codex run failed" >> "$LOG_FILE"
  fi

  cp "$REVIEW_FILE" "$PREV_FILE"
  last_hash="$(shasum -a 256 "$REVIEW_FILE" | awk '{print $1}')"
done

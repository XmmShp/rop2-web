#!/bin/sh

# 生成包含环境变量的 JavaScript 文件
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__env__ = {
  APIBASE: '${APIBASE}'
};
EOF

# 启动 nginx
nginx -g 'daemon off;'

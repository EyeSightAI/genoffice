#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""UToOffice 卡密生成器 —— 生成卡密用于发卡平台销售。

用法：
  python tools/generate-cards.py lifetime 10    # 生成 10 张永久卡
  python tools/generate-cards.py year 20        # 生成 20 张年卡

卡密格式：UTO-<base64url(payload)><签名16字符>
注意：SECRET 必须与 apps/shell/src/main/membership.ts 保持一致。
"""

import base64
import hashlib
import hmac
import json
import sys
import time
import uuid

# 必须与 apps/shell/src/main/membership.ts 的 SECRET 一致
SECRET = 'UTO-office-2026-membership-secret'


def sign(data: str) -> str:
    h = hmac.new(SECRET.encode(), data.encode(), hashlib.sha256).digest()
    return base64.urlsafe_b64encode(h).decode().rstrip('=')[:16]


def generate_card(type_: str) -> str:
    exp = 0 if type_ == 'lifetime' else int(time.time() * 1000) + 365 * 24 * 3600 * 1000
    payload = json.dumps({'plan': 'pro', 'type': type_, 'exp': exp, 'id': str(uuid.uuid4())}, separators=(',', ':'))
    body = base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')
    return f'UTO-{body}{sign(body)}'


def main() -> None:
    type_ = sys.argv[1] if len(sys.argv) > 1 else 'lifetime'
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    if type_ not in ('lifetime', 'year'):
        print('用法：python tools/generate-cards.py <lifetime|year> [数量]')
        sys.exit(1)
    cards = [generate_card(type_) for _ in range(count)]
    out = f'cards-{type_}.txt'
    with open(out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(cards) + '\n')
    label = '永久卡' if type_ == 'lifetime' else '年卡'
    print(f'已生成 {count} 张{label}，保存到 {out}')
    for c in cards:
        print(c)


if __name__ == '__main__':
    main()

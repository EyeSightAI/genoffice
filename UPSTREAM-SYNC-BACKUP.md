# UTOOffice 升级前回溯记录

> 记录时间：2026-09-30
> 用途：升级上游 v0.11.0 前，保留当前版本完整状态，便于出问题回溯。
> 这是「升级前最后状态」的权威记录，升级后如遇到无法解决的问题，按本文档回溯。

## Git 回溯锚点

| 项 | 值 |
|---|---|
| 当前分支 | `main` |
| HEAD commit | `dadfea6b94e9f9c53ab0fd553fb26b9186be4f58` |
| 回溯 tag | `pre-v0.11-sync` |
| 备份分支 | `backup/pre-v0.11-sync` |
| 版本号 | `0.9.27`（apps/shell/package.json） |
| fork base | 上游 `v0.9.431`（2026-09-09 发布） |

### 如何回溯

```bash
git checkout pre-v0.11-sync           # 回到升级前的代码（tag 锚点）
git checkout backup/pre-v0.11-sync    # 或回到备份分支
```

## 自定义功能清单（升级后必须重新移植）

这些是 UTOOffice 相对上游的独有功能，升级到 v0.11.0 后要逐个搬过去：

1. **微信扫码登录** —— `apps/shell/src/main/wx-login.ts`（独立模块）+ home-api.ts 类型 + main/index.ts 的 ipcMain + preload 暴露 + SettingsModal 登录弹层
2. **统一会员** —— 读 `userData/wx-login.json` 判断 isPro/expireTime；slides 的 `slides:membership-status` handler + `readWxLoginIsPro()`
3. **模板库 AI 工具** —— `slides-skill.ts` 的 search_templates / open_template 工具 + `templates-meta.json`（561 套）+ gating（未勾选「使用模板库」隐藏）+ openTemplate 后 `applyDeck` 应用 slides
4. **付款码购买** —— `/api/wx/buy_qrcode`（scene=token）+ `/api/wx/poll_buy` + 小程序 buy.js 双模式 + SettingsModal「开通会员」付款码弹层
5. **退款收回** —— `vp_pay.py` deliver_notify 的 `xpay_refund_notify` 分支（退款收回会员）+ `_handle_refund`
6. **会员定时刷新** —— shell accountStatus / slides membershipStatus 每 5 分钟查服务器（退款/过期自动感知）
7. **关于页品牌** —— 「开源项目」→「加入我们」+ `uto-office.cn`；GITHUB_REPO_URL 指向 https://uto-office.cn/
8. **模板库「更多模板」按钮** —— `slides:open-template-library` handler → https://utooffice-templates.vercel.app

## 服务器部署状态（47.109.16.117）

| 项 | 值 |
|---|---|
| auth-system | supervisord 管理，`wx_auth.py` + `vp_pay.py`（下单/发货/查单/退款通知） |
| 数据库 | MySQL `auth_system`，用户 `auth_admin`（密码见服务器 `/www/wwwroot/auth-system/.env` 的 DB_PWD） |
| 表结构 | `member`（openid + expire_time）、`pay_order`（out_trade_no + openid + pay_status）、`pay_package`（id=8 年卡 ¥99/365天） |
| 更新目录 | `/www/wwwroot/update/`：UToOffice-Setup.exe + latest.yml（version 0.9.27） |
| 模板库网站 | https://utooffice-templates.vercel.app（Vercel，repo EyeSightAI/utooffice-templates） |
| 门户网站 | https://uto-office.cn |

## 小程序

| 项 | 值 |
|---|---|
| 正式版 | 0.0.3 已发布 |
| 审核中 | 0.0.4（扫码自动下单） |
| 虚拟支付 | AppID `wx524d8292708bbf91` / OfferID `1450652689` / 道具 `nianka` ¥99 |

## 关键文件位置

- **桌面端微信/会员**：`apps/shell/src/main/wx-login.ts`、`index.ts`、`preload/index.ts`、`shared/home-api.ts`、`renderer/src/SettingsModal.tsx`、`Home.tsx`
- **slides 模板库**：`apps/slides/src/main/slides-main.ts`、`renderer/ai/AiPanel.tsx`、`slides-skill.ts`、`templates-meta.json`
- **服务器后端**：桌面「小程序虚拟支付」目录下的 `wx_auth.py`、`vp_pay.py`

## 已知残留问题（升级后可一并解决）

- 模板库「使用模板库」功能刚实现（v0.9.27），仍需用户实测验证
- 下载走服务器 3 Mbps 带宽慢（待上 OSS+CDN）
- 小程序 0.0.4 自动下单审核中
- 公安联网备案（30 日内）
- 分销技术实现（agent 表 + 推广码 + 返佣记账）待做

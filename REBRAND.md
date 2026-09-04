# UToOffice 换皮改造清单（Phase 0）

> 本项目 fork 自 [genspark-ai/genoffice](https://github.com/genspark-ai/genoffice)（Apache-2.0）。
> 换皮目标：把 GenOffice/Genspark 全部改成 UToOffice，清除商标残留，保留 Apache-2.0 合规要求。
>
> 生成时间：2026-09-04

## 一、项目信息

| 项 | 值 |
|---|---|
| 上游仓库 | `genspark-ai/genoffice`（Apache-2.0） |
| 我的 fork | `EyeSightAI/genoffice` |
| 本地路径 | `C:\Users\YouTo\UToOffice` |
| remote | origin=EyeSightAI/genoffice, upstream=genspark-ai/genoffice |
| 品牌名 | UToOffice |
| 构建方式 | GitHub Actions（release.yml，workflow_dispatch 触发，workflow id=350021990） |
| 更新/埋点 | 走环境变量注入（见下），埋点未设 env 自动禁用 |

## 二、换皮改动清单

### 1. 产品名 / appId

| 文件 | 改动 |
|---|---|
| `apps/shell/electron-builder.cjs` | `appId: 'com.genoffice.app'` → `com.utooffice.app`；`productName: 'GenOffice'` → `UToOffice` |
| `apps/shell/electron-builder.cjs` | `maintainer`/`vendor`: `'Mainfunc, Inc. <team@genspark.ai>'` → `'UToOffice'` |
| `apps/shell/electron-builder.cjs` | linux: `executableName`/`packageName`: `genoffice` → `utooffice`；`artifactName` 同步改 |
| `apps/*/package.json`（6 个 app） | `productName`：`GenOffice Docs/Sheets/Slides/PDF/Markdown` → `UToOffice ...`；shell → `UToOffice` |
| `apps/docs/package.json` + `apps/slides/package.json` | `appId`: `com.genoffice.docs/slides` → `com.utooffice.docs/slides` |

### 2. 图标 / Logo

| 文件 | 改动 |
|---|---|
| `apps/docs/build/icon.{png,ico,icon-mac.png}` | 用 UToLogo 替换（Pillow 生成多尺寸 ico） |
| `apps/shell/build/icon.{png,ico,icon-mac.png}` | 同上 |
| `apps/shell/src/renderer/src/assets/app-icon.png` | 用 UToLogo 替换（onboarding 图标） |
| `apps/shell/src/renderer/src/assets/genoffice-logo.svg` | 换成 UToLogo 图标 + `<text>UToOffice</text>`（侧边栏 logo lockup）。**原版尺寸：整体 1091×240，图标 240×240，文字约 766×131px（font-size 约 180）**；我的文字用 `font-size 175`，`x=300 y=185` |

> ⚠️ 注意：安装包图标在 `build/`，应用内 UI 图标在 `src/renderer/src/assets/`，两处都要改。

### 3. NOTICE（法律要求）

`NOTICE` 文件：保留原 Mainfunc 版权声明 + Unicode 声明，**新增** UToOffice 版权 + 注明「这是 GenOffice 的衍生作品，做了品牌改名和中文本地化」。

### 4. shell 界面文案（`apps/shell/src/renderer/src/strings.ts`）

zh + en 两版：
- 所有 `GenOffice` → `UToOffice`
- `Genspark Projects` → `云端项目` / `Cloud Projects`
- `Genspark 账号` → `账号`；`登录 Genspark` → `登录账号`
- `积分`/`credits` → `用量`/`Usage`
- `Genspark 云工具` → `AI 云工具`
- `加入 GenTeam` → `提交反馈`；`1,000+ Genspark 积分` → 中性文案
- `发送匿名统计…Google Analytics 4` → `本应用不收集任何使用数据`

### 5. 编辑器 AI 面板文案（docs/sheets/slides 的 `i18n/ai/*.ts` + `i18n/app/*.ts`）

zh + en 两版：
- `aiPanelTitle: 'Genspark'` → `'AI 助手'` / `'AI Assistant'`
- `登录 Genspark` → `登录`；`Genspark 账号` → `账号`
- `未登录（AI 功能需要登录 Genspark 账号）` → 去掉 Genspark
- `Genspark 积分已用完…` → `额度已用完，请检查你的 API Key 余额`

### 6. 硬编码「Genspark AI」（不走 i18n）

| 文件 | 改动 |
|---|---|
| `apps/docs/src/renderer/components/Ribbon.tsx` | `<span>Genspark AI</span>` 和 `<div class="ribbon-group-label">Genspark AI</div>` → `AI 助手` |
| `apps/markdown/src/renderer/components/Ribbon.tsx` | `<span>Genspark AI</span>` → `AI 助手` |

### 7. URL 链接

| 文件 | 改动 |
|---|---|
| `apps/shell/src/main/index.ts` | `GENTEAM_URL`: `https://genoffice.ai/join` → `https://github.com/EyeSightAI/genoffice/issues` |
| `apps/shell/src/main/index.ts` | GitHub star API: `genspark-ai/genoffice` → `EyeSightAI/genoffice` |
| `apps/shell/src/renderer/src/SettingsModal.tsx` | `github.com/genspark-ai/genoffice` → `github.com/EyeSightAI/genoffice` |
| `packages/electron-utils/src/github-menu.ts` | `GITHUB_REPO_URL`（**star 按钮 + 菜单**打开的就是它）: `genspark-ai/genoffice` → `EyeSightAI/genoffice` |
| `apps/shell/src/main/updater.ts` | `DOWNLOAD_PAGE_URL`（更新器下载页）: `genspark-ai/genoffice/releases/latest` → `EyeSightAI/...` |
| `apps/shell/src/main/index.ts` | `CREDIT_USAGE_URL`（账户「查看用量」）: `genspark.ai/credit-usage` → `EyeSightAI/genoffice` |

### 8. AI 工具描述

| 文件 | 改动 |
|---|---|
| `apps/docs/src/renderer/ai/tools.ts` | `Requires Genspark login` → `Requires signing in` |

### 9. 构建配置

| 文件 | 改动 |
|---|---|
| `apps/shell/electron-builder.cjs` | Windows sidecar 路径：`target/x86_64-pc-windows-gnu/release/` → `target/release/`（在 windows runner 上 host 编译） |
| `.github/workflows/release.yml` | 新建：windows-latest 上跑 `npm run dist:win`，产出 NSIS 安装包 |

### 10. 埋点（无需改代码）

不设置 `GENOFFICE_GA4_MEASUREMENT_ID` / `GENOFFICE_GA4_API_SECRET` 环境变量 → 打包的 app 自动禁用埋点（上游已设计好）。

## 三、绝对不能改的（改了会崩）

| 项 | 原因 |
|---|---|
| `@genoffice/*` 包名 | npm workspace 引用，改了构建全崩 |
| 字体别名 `GenOffice Songti SC`/`GenOffice Sans KR`/`GenOffice PUA Blank` 等 | 与 `fonts.css` 的 `@font-face` 一一对应，改了字体渲染崩 |
| PDF 内部字段名 `GenOfficeStaticFormFills`/`GenOfficeFormField` 等 | 写入 PDF 的元数据键名，改了新旧文件不兼容 |
| LICENSE / NOTICE | Apache-2.0 要求保留原版权 |

## 四、构建 & 下载流程

1. 改完代码 → `git add -A && git commit` → `git push origin main`（走代理）
2. 触发构建：GitHub API `POST /repos/EyeSightAI/genoffice/actions/workflows/350021990/dispatches`
3. 等构建完成（约 10-30 分钟）→ 下载 artifact → **验证字节数** → 复制桌面
4. 用户侧：关应用 → 装新包（必要时清 userData/杀进程）

## 五、踩过的坑（重要教训）

1. **网络**：本机 github.com 直连不通，必须走代理 `127.0.0.1:7897`（git 已配 http.proxy/https.proxy）
2. **git 认证**：PAT 是 `gho_` 前缀的 OAuth token（不是 ghp_），存 `~/.git-credentials`
3. **下载 artifact 必须验证字节数**：曾因 curl 退出码被管道吃掉，复制了旧包，害用户反复重装无效
4. **应用运行时重装不生效**：进程锁文件，先 `taskkill /F /IM UToOffice.exe` 再装
5. **userData 残留**：`%APPDATA%\GenOffice` 和 `%APPDATA%\UToOffice` 两个目录，重装前清掉
6. **「Genspark AI」是硬编码**：在 Ribbon.tsx 里，不走 i18n，容易被漏
7. **安装包未签名**：Windows 11「智能应用控制」会拦截，需关闭该功能或买签名证书

## 六、剩余工作（Phase 1）

- 17 种其他语言（ja/ko/de/fr/es/…）的 Genspark 文案残留
- Genspark 登录功能代码（设备码登录、gsk 工具端点）
- 会员卡密激活系统
- 增值功能（中文办公专业资产包）
- 发卡平台收款
- 代码签名证书

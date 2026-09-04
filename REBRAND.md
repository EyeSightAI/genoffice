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
| `apps/shell/src/renderer/src/assets/genoffice-logo.svg` | 换成 UToLogo 图标 + `<text>UToOffice</text>`（侧边栏 logo lockup）。**原版尺寸：整体 1091×240，图标 240×240，文字约 766×131px（font-size 约 180）**；我的文字用 `font-size 180`，`x=300 y=185` |

> ⚠️ 注意：安装包图标在 `build/`，应用内 UI 图标在 `src/renderer/src/assets/`，两处都要改。
>
> **⚠️ logo 留白问题（重要）**：用户原始 `UTOlogo.png`（1024×1024）有大量透明留白（logo 图形只占 64%×74%，尤其下面留白 242px），直接缩放会让桌面图标/侧边栏 logo 显得很小。**必须先裁掉留白**：`im.getbbox()` 取非透明区域 + 5% padding，居中放到正方形，生成 `UTOlogo_tight.png`（图形占 80%×92%），再用紧凑版生成图标和 svg base64。

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

### 5. 编辑器 AI 面板文案

**⚠️ 结构差异（重要）**：
- docs/sheets/slides 的 i18n 是**分文件**（`i18n/ai/zh.ts` + `i18n/app/zh.ts`）
- **pdf 的 i18n 是单文件 `i18n/strings.ts`**（19 语言在一个文件里，含 `ribbonAiAssistant: 'Genspark'`）
- markdown 的 i18n 里**没有** Genspark（它的残留是硬编码，见第 6 节）

zh + en 两版：
- `aiPanelTitle: 'Genspark'` → `'AI 助手'` / `'AI Assistant'`
- `登录 Genspark` → `登录`；`Genspark 账号` → `账号`
- `未登录（AI 功能需要登录 Genspark 账号）` → 去掉 Genspark
- `Genspark 积分已用完…` → `额度已用完，请检查你的 API Key 余额`
- pdf 的 `ribbonAiAssistant: 'Genspark'` → `'AI 助手'` / `'AI Assistant'`

### 6. 硬编码「Genspark / Genspark AI」（不走 i18n，分散在各 app 组件里）

| 文件 | 改动 |
|---|---|
| `apps/docs/src/renderer/components/Ribbon.tsx` | `<span>Genspark AI</span>` 和 `<div class="ribbon-group-label">Genspark AI</div>` → `AI 助手` |
| `apps/markdown/src/renderer/components/Ribbon.tsx` | `<span>Genspark AI</span>` → `AI 助手` |
| `apps/slides/src/renderer/App.tsx` + `components/RibbonHomeTab.tsx` + `ai/AiPanel.tsx` | `<span>Genspark AI</span>`、`<Group label="Genspark AI">`、`aria-label="Genspark AI"` → `AI 助手` |
| `apps/sheets/src/renderer/ExcelShell.tsx` + `ai/AiChatPanel.tsx` | `<strong>Genspark AI</strong>`、`aria-label="Genspark"` → `AI 助手` |
| `apps/pdf/src/renderer/App.tsx` + `ai/AiPanel.tsx` | `<span>Genspark AI</span>`、`aria-label="Genspark"` → `AI 助手` |
| `apps/markdown/src/renderer/ai/AiPanel.tsx` | `aria-label="Genspark"` → `AI 助手`；标题 `<GensparkMark/>` + `Genspark` 文字 → UToLogo base64 图标 + `AI 助手` |
| `apps/markdown/src/renderer/App.tsx` + `components/Ribbon.tsx` | `<GensparkMark/>` 图标 → 已随 GensparkMark 组件替换为 UToLogo |

> **GensparkMark 图标组件（每个 app 各有一个独立定义，都要替换成 UToLogo base64 图片）**：
> - docs `components/icons.tsx:1660`、slides `components/icons.tsx:2140`、pdf `ai/AiPanel.tsx:891`、sheets `ribbon-icons.tsx:716`、markdown `ai/AiPanel.tsx:1022`
> - 替换体：`return <img src="data:image/png;base64,{B64}" width={size} height={size} alt="" />`（保留各自签名；**用字符串拼接，别用 f-string**——花括号转义会生成 `style={ display:"block" }` 这种非法 JSX 导致构建失败）
>
> **AI 面板标题硬编码「Genspark」文字（JSX 文本节点，非 i18n）**：markdown `AiPanel.tsx:575`、pdf `AiPanel.tsx:546`、sheets `AiChatPanel.tsx:512` → 都改 `AI 助手`（docs/slides 用的是 i18n `aiPanelTitle`，改 zh/en 即可）

> 通用替换：`Genspark AI`→`AI 助手`、`"Genspark"`/`'Genspark'`→`AI 助手`。

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

## 六、换皮验收检查（未来「验收程序」的核心规则）

每次上游更新换皮后，跑下面 5 组检查，**期望结果都是「干净」**（无输出，或只剩白名单）。

### A. 产品名残留（GenOffice）
```bash
grep -rn "GenOffice" apps/shell/src/ apps/*/src/renderer/ --include='*.ts' --include='*.tsx' \
  | grep -viE '@genoffice|fonts\.css|GenOffice (PUA|Sans|Serif|Gothic|Songti|Box|Hiragino)|StaticForm|FormField|doc-style'
```
期望：无输出（白名单 = 字体别名、@genoffice 包名、PDF 字段名，都是允许的）。

### B. 商标残留（Genspark）
```bash
grep -rn "Genspark" apps/*/src/ packages/ --include='*.ts' --include='*.tsx' \
  | grep -viE '@genspark|@genoffice|\.test\.|// |/\*|GENSPARK_ORIGIN|gsk|errGsk|GensparkMark|image-skill|fonts\.css'
```
期望：Phase 0 后无用户可见残留。剩下的 `gsk`/`errGsk`/`GENSPARK_ORIGIN` 是 Phase 1 删登录时的白名单，删登录后这些也会消失。

### C. URL 残留
```bash
grep -rn "genspark-ai\|genoffice\.ai\|genspark\.ai\|genspark\.com" apps/ packages/ --include='*.ts' --include='*.tsx' \
  | grep -viE '\.test\.|// |/\*'
```
期望：无输出（注释里的历史 issue 链接是允许的）。

### D. 图标组件（GensparkMark → UToLogo）
```bash
grep -rn "function GensparkMark" apps/*/src/
```
期望：恰好 5 处（docs/slides 的 `components/icons.tsx`、pdf/markdown 的 `ai/AiPanel.tsx`、sheets 的 `ribbon-icons.tsx`），且每处下一行都是 `return <img src="data:image/png;base64,`。

### E. AI 面板标题硬编码文字
```bash
grep -rn "Genspark" apps/*/src/renderer/ai/*.tsx apps/*/src/renderer/*Shell.tsx \
  | grep -viE 'GensparkMark|// |/\*'
```
期望：无输出（标题文字都已改「AI 助手」）。

### 验收程序落地建议
做成脚本时，按 A–E 五条规则跑 grep，任一规则「非干净」即判定换皮不彻底。白名单用固定正则；未来新增残留类型时，往对应白名单追加条目即可。图标 D 条还需要校验 `return <img` 这一行存在（不只数 5 处）。

## 七、剩余工作（Phase 1）

- 17 种其他语言（ja/ko/de/fr/es/…）的 Genspark 文案残留
- Genspark 登录功能代码（设备码登录、gsk 工具端点）
- 会员卡密激活系统
- 增值功能（中文办公专业资产包）
- 发卡平台收款
- 代码签名证书

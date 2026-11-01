# 从零到 GitHub：一份可以反复复习的 Git 学习笔记

> 这份文档来自一次真实的小项目开发全过程（2026-11-01，网页版待办清单）。
> 里面每一条命令都在本机真实执行过，每一个报错都是真实遇到并解决掉的。
> 建议复习时**先看目录，挑忘记的那一章**，而不是从头读。

---

## 目录

- [0. 这次到底做了什么（先有个全局图）](#0-这次到底做了什么先有个全局图)
- [1. Git 的心智模型：四区与库房](#1-git-的心智模型四区与库房)
- [2. 环境准备：装了什么、配了什么](#2-环境准备装了什么配了什么)
- [3. 从零开始一个项目](#3-从零开始一个项目)
- [4. 日常循环：改 → 加 → 提交 → 推送](#4-日常循环改--加--提交--推送)
- [5. 分支与 Pull Request](#5-分支与-pull-request)
- [6. 时光机：回退到某个版本](#6-时光机回退到某个版本)
- [7. 换一个新项目怎么做](#7-换一个新项目怎么做)
- [8. 排错手册（全是真实踩过的坑）](#8-排错手册全是真实踩过的坑)
- [9. 命令速查表](#9-命令速查表)
- [10. 术语表](#10-术语表)

---

## 0. 这次到底做了什么（先有个全局图）

### 项目

纯前端网页版待办清单，6 个文件：

| 文件 | 作用 |
|---|---|
| `index.html` | 页面结构（输入框、筛选按钮、列表） |
| `style.css` | 样式 |
| `app.js` | 逻辑（增删改查 + localStorage 持久化） |
| `README.md` | 项目说明 |
| `.gitignore` | 告诉 git「哪些文件不要管」 |
| `.gitattributes` | 换行符等文件级设置 |

三个功能：
1. 增删待办、勾选完成
2. 按状态筛选（全部 / 未完成 / 已完成）
3. 双击待办文字编辑（回车保存、Esc 取消）

### 仓库

- 本地：`E:\DSH\lianxigit`（仓库根目录，`.git` 就在里面）
- 远程：https://github.com/SIxuanZ/lianxigit
- 分支：`main`（主线）+ `feat/edit-todo`（功能分支，已合并）

### 真实的提交历史

```
9d95c30  Merge pull request #1 from SIxuanZ/feat/edit-todo   ← GitHub 上点的合并
955a5f6  feat: 支持双击编辑待办                              ← 分支上的提交
bc5dd53  feat: 新增按状态筛选待办（全部/未完成/已完成）        ← 第二次开发
bbe6d4d  初始化项目：待办清单页面、样式与交互逻辑              ← 第一次提交
```

**学会看这张图**：一条线上的每次提交都是一个"存档点"，合并在最上面把两条线连起来。

### 走过的完整路线

```
装环境 → 写代码 → git init → 提交 → 建 GitHub 仓库
   → remote add → push → 改代码 → commit → push
   → 开分支 → 改代码 → commit → push → 开 PR → 合并 → pull 回本地
```

---

## 1. Git 的心智模型：四区与库房

### 1.1 四区（最重要的一张图）

```
 ┌─────────────┐  git add   ┌─────────────┐  git commit  ┌──────────────┐  git push  ┌──────────┐
 │   工作区     │ ─────────> │   暂存区     │ ───────────> │   本地仓库    │ ─────────> │  远程仓库 │
 │  你编辑的文件 │            │ .git/index  │              │ .git/objects │            │  GitHub  │
 └─────────────┘            └─────────────┘              └──────────────┘            └──────────┘
                                                                  ↑
                                                        git pull / fetch 从右往左
```

- **工作区**：你在资源管理器里能看到的那些文件
- **暂存区**：`git add` 之后东西进的"待发货区"，本质是 `.git/index` 这个文件
- **本地仓库**：`.git/objects` + `.git/refs`，所有历史都在这
- **远程仓库**：GitHub 上那份

新手口诀：**改完先 add（挑），再 commit（打包存档），最后 push（上传）**。

### 1.2 文件夹和仓库的关系

**仓库 = 普通文件夹 + 里面的 `.git` 隐藏目录。** 没有别的东西。

```
E:\DSH\lianxigit\           ← 仓库根目录（= 工作区）
├─ index.html  app.js  ...  ← 你看到的文件，只是"当前版本"摊开的样子
└─ .git\                    ← 隐藏目录，仓库本体
   ├─ HEAD              内容一行：ref: refs/heads/main     （我现在在哪条线上）
   ├─ config            远端地址、SSL 设置、分支跟踪关系
   ├─ index             暂存区
   ├─ objects\          所有版本的内容（压缩存储）
   ├─ refs\heads\main   内容一行：9d95c30b6e34...          （main 指向哪个提交）
   └─ logs\             reflog，你的操作日志
```

**分支其实就是一个存着提交号的小文本文件。** 没别的。

### 1.3 一个提交里存了什么

`git cat-file -p 9d95c30` 的真实输出：

```
tree 7b63a49f...
parent bc5dd536...        ← 上一个版本
parent 955a5f6e...        ← 合并时有两个 parent
author SIxuanZ <...>
message Merge pull request #1 ...
```

顺着 `tree` 再看一层，是一张清单（文件名 → 内容哈希）：

```
100644 blob 001c02c8...   app.js
100644 blob 578853c8...   index.html
...
```

- **blob** = 文件内容
- **tree** = 目录（文件名到 blob 的映射）
- **commit** = 一个 tree + 父提交 + 作者 + 说明

内容用**哈希**命名，所以同样的内容只存一份。这也是为什么整个 `.git` 才 0.05 MB。

### 1.4 为什么文件夹里永远只有一份文件

因为 **`.git` 是库房，文件夹是桌面**。库房里堆着所有版本，桌面上只摊开一版。
切分支时 git 做的事就是：把目标版本的内容**解压后覆盖写入**工作区那批文件。

实测数据（这个仓库）：

| 项目 | 数值 |
|---|---|
| 工作区可见文件 | 6 个 |
| `.git` 里的对象 | 21 个，14.89 KiB |
| `.git` 整个目录 | 60 个文件，0.05 MB |

同一个 `app.js` 在不同版本里是**不同哈希**：

| 版本 | app.js 的 blob | 有双击编辑吗 |
|---|---|---|
| `bc5dd53` | `97566947...` | ❌ |
| `955a5f6` / `main` | `001c02c8...` | ✅ |

三份内容同时在 `.git` 里，只是同一时刻只有一份被摊到 `app.js` 这个路径上。

---

## 2. 环境准备：装了什么、配了什么

### 2.1 本机环境

| 组件 | 版本 / 状态 |
|---|---|
| Windows | 10.0.22621 |
| PowerShell | 5.1.22621 |
| git | 2.51.2.windows.1 |
| git-lfs | 3.7.1 |
| Node.js | v24.17.0 |
| 凭据管理器 | Git Credential Manager（GCM，随 Git 安装） |

### 2.2 一次性全局配置（已设好，换新项目不用重设）

```powershell
git config --global user.name  "zhangsixuan"
git config --global user.email "1057950343@qq.com"
git config --global credential.helper manager      # 用 GCM 记住账号，不用每次输密码
```

凭据存在 Windows 凭据管理器里，**按 `github.com` 这个网站存**，所以：

- 新建第 2、第 10 个仓库 → **不用重新登录**
- 换电脑 → 需要重新登录一次
- 换 GitHub 账号 → 需要先清掉旧凭据

查看已有凭据：`cmdkey /list | findstr github`

### 2.3 这个仓库的本地配置（`.git/config`）

```ini
[core]
    quotepath = false        # 中文文件名不显示成 \344\275\240
    autocrlf = false         # 不加 CRLF 转换，文件保持原样
[http]
    sslBackend = openssl     # 关键！见 8.3
[remote "origin"]
    url = https://github.com/SIxuanZ/lianxigit.git
```

### 2.4 `gitr`：自动重试的 git 命令

GitHub 在国内直连会间歇性连不上（详见 [8.4](#84-failed-to-connect-to-githubcom-port-443)）。为此在 PowerShell 配置里装了一个函数 **`gitr`**：

- 文件：`C:\Users\000639\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`
- 用法：把 `git` 换成 `gitr`，例如 `gitr pull`、`gitr push`
- 行为：**只对网络类错误**重试（最多 6 次，间隔 3 秒）；命令本身写错会立刻报错，不空转
- 生效条件：**必须新开一个 PowerShell 窗口**

---

## 3. 从零开始一个项目

### 3.1 标准流程（七步）

```powershell
cd D:\code\my-project

git init -b main                 # 1. 点亮 git 能力（生成 .git，只做一次）
#    （先写 .gitignore！）
git add .                        # 2. 把文件放进暂存区
git status                       # 3. 检查清单对不对
git commit -m "初始化项目：xxx"   # 4. 存档

# 5. 去 https://github.com/new 建空仓库（什么都不要勾）
git remote add origin https://github.com/SIxuanZ/my-project.git   # 6. 连上远程
gitr push -u origin main         # 7. 推送并绑定上游
```

`-u`（`--set-upstream`）的作用：让本地 `main` 记住"我的老家是 `origin/main`"，以后直接 `git push` / `git pull` 就行，不用再写远程名和分支名。

### 3.2 三个必须避开的坑

**坑 1：建 GitHub 仓库时勾了 README / .gitignore / LICENSE**
远程会多出一个提交，和本地历史不同源，push 会被拒：

```
! [rejected] main -> main (fetch first)
```

补救：`git pull --rebase origin main` 再 push。**最省事：建仓时什么都别勾。**

**坑 2：在已有 `.git` 的文件夹里再 `git init`**
从别处拷来的项目本来就带 `.git`，不需要 init。改远程地址即可：

```powershell
git remote set-url origin https://github.com/SIxuanZ/新名字.git
```

**坑 3：`git add .` 之前没写 `.gitignore`**
把 `node_modules`（几万个文件）提交进去后很难清理。**先 `.gitignore`，再 `add`。**

### 3.3 自查清单

| 检查 | 命令 | 期望 |
|---|---|---|
| git 认没认这个文件夹 | `git status` | `On branch main` |
| 远程对不对 | `git remote -v` | 两行 origin |
| 有没有提交 | `git log --oneline` | 至少一条 |
| 上游绑没绑 | `git status -sb` | `## main...origin/main` |
| 线上有没有 | 刷 GitHub 页面 | 能看到文件 |

---

## 4. 日常循环：改 → 加 → 提交 → 推送

### 4.1 四步循环

```powershell
git status                  # 看改了什么（随时可敲，最安全的命令）
git diff                    # 看具体改了哪几行
git add app.js              # 挑文件（或 git add -A 全加）
git commit -m "feat: ..."   # 存档
gitr push                   # 上传
```

### 4.2 提交信息怎么写

格式：`类型: 做了什么`

| 类型 | 用于 |
|---|---|
| `feat` | 新功能 |
| `fix` | 修 bug |
| `docs` | 文档 |
| `style` | 只改格式 |
| `refactor` | 重构（不改行为） |
| `chore` | 杂事（依赖、配置） |

真实例子：
```
feat: 新增按状态筛选待办（全部/未完成/已完成）
feat: 支持双击编辑待办
```

原则：**写完这句话，别人（和三个月后的你）能看懂"这次改了什么、为什么"**。

### 4.3 提交 ≠ 推送

| | 存到哪 | 别人能看到 | 断网会丢吗 |
|---|---|---|---|
| 提交 commit | 本地 `.git` | 不能 | 不会 |
| 推送 push | GitHub | 能 | 已备份 |

分开做完全没问题，很多人攒几个提交再一起推。**push 是幂等的**——重复推不会产生重复提交，只会显示 `Everything up-to-date`。

---

## 5. 分支与 Pull Request

### 5.1 为什么用分支

`main` 是**随时可以发布的线**。开发新功能时开一条平行线，做完再合并回去——这样即使做到一半，`main` 依然是好的。

命名约定：`feat/功能名`、`fix/问题名`、`docs/文档名`。

### 5.2 本项目的真实流程（照着做即可）

```powershell
git switch -c feat/edit-todo     # 1. 从 main 拉一条新分支
# ...改代码...
git add -A
git commit -m "feat: 支持双击编辑待办"
gitr push -u origin feat/edit-todo   # 2. 推到远程
```

3. 打开 GitHub 仓库页 → 出现黄色条 **Compare & pull request** → 点它
4. base 选 `main`，compare 选 `feat/edit-todo` → **Create pull request**
5. 检查 Files changed 里逐行看改动 → **Merge pull request** → **Confirm merge**
6. 回到本地，把合并结果拉回来：

```powershell
git switch main
gitr pull                        # 这一步不做，本地就会落后！
git branch -d feat/edit-todo     # 可选：删掉已合并的本地分支
```

### 5.3 关于 PR 的价值

- **留痕**：为什么改、改了什么，全在一个页面里
- **审查**：逐行看 diff，比直接推 main 安全
- **可接 CI**：以后加自动化测试，PR 会自动跑
- **回滚方便**：合并提交可以整体 revert

### 5.4 合并后必须 pull

GitHub 上合并产生了新提交（`9d95c30`），你本地 `main` 还停在 `bc5dd53`。
**不同步就继续开发，迟早冲突。** 这次就是靠 `git pull` 快进（fast-forward）解决的：

```
Updating bc5dd53..9d95c30
Fast-forward
 app.js | 40 ++++++++++++
```

---

## 6. 时光机：回退到某个版本

按"危险程度"排，从安全到危险：

| 目的 | 命令 | 改工作区 | 能推送 |
|---|---|---|---|
| **只看**，不动文件 | `git show bc5dd53:app.js` | ❌ | — |
| 看两个版本差多少 | `git diff --stat bc5dd53 main` | ❌ | — |
| 只回退**一个文件** | `git restore --source=bc5dd53 app.js` | ✅ 覆盖该文件 | ✅ |
| **临时**整个项目回到老版本 | `git switch --detach bc5dd53` | ✅ 全换 | ⚠️ 别在此提交 |
| 撤销某次**已推送**的提交 | `git revert <提交号>` | ✅ 生成新提交 | ✅ |
| 让分支**彻底**回到旧位置 | `git reset --hard bc5dd53` | ✅ 连未提交改动一起抹 | ⚠️ 需 `push --force-with-lease` |

### 6.1 `git reset` 三档

| 参数 | HEAD 指针 | 暂存区 | 工作区文件 | 未提交改动 |
|---|---|---|---|---|
| `--soft` | 后退 | 不动 | 不动 | 保留（在暂存区） |
| `--mixed`（默认） | 后退 | 重置 | 不动 | 保留（未暂存） |
| `--hard` | 后退 | 重置 | **重置** | **全丢** |

### 6.2 后悔药：`git reflog`

```powershell
git reflog
# 9d95c30 HEAD@{0}: pull: Fast-forward
# bc5dd53 HEAD@{1}: commit: feat: 新增按状态筛选待办
```

**只要提交过，就丢不了。** `--hard` 抹掉后，用 reflog 找到提交号，`git reset --hard <号>` 就能回来。

### 6.3 区分 revert 和 reset

- `revert`：**往前**走一步，用新提交抵消旧改动 → 历史完整，**可以推**
- `reset`：**往回**退指针，相当于"那段历史没发生过" → 改历史，**已推送的千万别用**

---

## 7. 换一个新项目怎么做

### 7.1 要重新建仓库吗

**要。一个项目 = 一个仓库。** GitHub 不会自动发现你电脑上新出现的文件夹。

### 7.2 要重新登录吗

**不用。** 凭据按 `github.com` 存，全局配置也已就位（见 2.2）。

### 7.3 完整七步

```powershell
cd D:\code\my-tool
git init -b main
# （先写 .gitignore）
git add .
git commit -m "初始化项目：xxx"

# GitHub 上建空仓库后：
git remote add origin https://github.com/SIxuanZ/my-tool.git
gitr push -u origin main
```

### 7.4 DSH Git 插件的注意事项

- 插件的「默认仓库路径」留空 = **跟随当前工作区**，新开工作区指向新文件夹即可，不用改配置
- `~/dsh/git-plugin.json` 里的 `projectParent` 只是**克隆时的默认保存目录**，不影响识别
- 插件不保存密码/token，认证沿用 Git 凭据管理器

---

## 8. 排错手册（全是真实踩过的坑）

### 8.1 `Permission denied`：无法创建 `.git/HEAD.lock`

```
error: cannot lock ref 'HEAD': Unable to create 'E:/DSH/lianxigit/.git/HEAD.lock': Permission denied
```

**原因**：DSH 文件沙箱默认只允许写工作区可见文件，`.git` 被保护。
**解决**：在 DSH 里执行 git 写操作时，需要授权"完全访问"（danger-full-access）。普通子目录能写，`.git` 不能——这是设计如此。
**判别**：`git status`（只读）能用，`git add` / `commit` / `push` 报错，就是这个问题。

### 8.2 `SetNamedSecurityInfoW failed (Win32 5): grantWrite`

**原因**：工作区目录的 ACL 权限不完整，沙箱无法授予写权限。
**解决**：用 `diagnose-windows-sandbox-acl` 诊断脚本修复（补齐 `writeOwner` 权限），并生成备份以便回滚。

### 8.3 `schannel: AcquireCredentialsHandle failed: SEC_E_NO_CREDENTIALS`

**现象**：`Invoke-WebRequest`、`curl.exe`、git 默认后端都失败。
**原因**：Windows schannel（TLS 后端）在受限环境下拿不到凭据句柄。
**解决**：

```powershell
git config --local http.sslBackend openssl
```

改用 OpenSSL 后端后 `git ls-remote` 立刻正常。

### 8.4 `Failed to connect to github.com port 443`

```
fatal: unable to access 'https://github.com/SIxuanZ/lianxigit.git/':
Failed to connect to github.com port 443 after 21100 ms: Could not connect to server
```

**原因**：DNS 把 `github.com` 解析到一个不稳定的入口 IP。实测：

| IP | 归属 | 3 次 TCP 连通 |
|---|---|---|
| `20.205.243.166`（DNS 当时给的） | 新加坡 | **1/3** ❌ |
| `140.82.112.3` | 美国 | 3/3 ✅ |
| `140.82.116.4` | 美国 | 3/3 ✅（最快，~200ms） |
| `ssh.github.com:443` | — | ✅ |

**解决（三选一）**：

1. **重试**（最简单）：装 `gitr` 自动重试，成功率 1/3 也能扛过去
2. **改 hosts**（需管理员）：`C:\Windows\System32\drivers\etc\hosts` 加一行 `140.82.116.4 github.com`
3. **改用 SSH over 443**：配 `~/.ssh/config`，走 `ssh.github.com:443`，最稳但需要一次密钥配置

**重要教训**：报错先查"到底成没成"，再决定要不要重试。

```powershell
git ls-remote --heads origin      # 直接问 GitHub：你那儿现在是什么？
```

真实案例：一次推送报了这个错，但 `ls-remote` 显示分支**已经在远程**了——说明推送其实成功了，报错只是网络层在喊话。

### 8.5 插件里「新建分支」按钮是灰色的

**排查过的原因**：按钮的 `disabled` 只受 `props.busy` 控制；而 `busy` 包含 AI 提交信息生成的占用。一次卡住的「AI 生成提交信息」会把 busy 永久锁住。

**解决顺序**：
1. F5 刷新页面
2. 重开工作台 / 重新进入工作区
3. 设置 → 插件 → Git → 重新加载
4. 兜底：命令行 `git switch -c feat/edit-todo`

### 8.6 push 被拒 `(fetch first)` / `(non-fast-forward)`

**原因**：远程有你本地没有的提交（通常是在 GitHub 网页上建仓时勾了 README）。

```powershell
git pull --rebase origin main
gitr push
```

### 8.7 切分支时提示「请先提交或储藏本地改动」

**原因**：git 怕覆盖你未提交的修改。三条路：

```powershell
git commit -m "wip: 临时保存"     # 1. 提交（推荐）
git stash                         # 2. 收进储藏室，回头 git stash pop
# 3. 顺便带过去（改动会跟着切分支走，通常不是你想要的）
```

### 8.8 `fatal: not a git repository`

**原因**：当前目录往上找不到 `.git`（可能被删了，或你在错误的地方）。
**确认**：`git rev-parse --show-toplevel` 看 git 认为仓库在哪。

---

## 9. 命令速查表

### 每天都会用的

| 目的 | 命令 |
|---|---|
| 现在什么状态 | `git status` |
| 看改了什么 | `git diff` |
| 加进暂存区 | `git add <文件>` / `git add -A` |
| 撤出暂存区 | `git restore --staged <文件>` |
| 存档 | `git commit -m "说明"` |
| 上传 | `gitr push` |
| 下载 | `gitr pull` |

### 看历史

| 目的 | 命令 |
|---|---|
| 一行一条历史 | `git log --oneline -10` |
| 带分支的图形 | `git log --oneline --graph --all` |
| 某次提交改了啥 | `git show <提交号>` |
| 某个文件的历史版本 | `git show <提交号>:<文件名>` |
| 谁改的哪一行 | `git blame <文件>` |
| 我的操作日志 | `git reflog` |

### 分支

| 目的 | 命令 |
|---|---|
| 看所有分支 | `git branch -a` |
| 新建并切过去 | `git switch -c feat/xxx` |
| 切分支 | `git switch main` |
| 删本地分支 | `git branch -d feat/xxx` |
| 删远程分支 | `git push origin --delete feat/xxx` |

### 远程

| 目的 | 命令 |
|---|---|
| 看远程地址 | `git remote -v` |
| 改远程地址 | `git remote set-url origin <新地址>` |
| 添加远程 | `git remote add origin <地址>` |
| 只取不合并 | `git fetch` |
| 取并合并 | `git pull` |
| 首次推送并绑定上游 | `git push -u origin main` |

### 撤销 / 回退

| 目的 | 命令 |
|---|---|
| 丢掉某个文件的未提交改动 | `git restore <文件>` |
| 把文件恢复到某版本 | `git restore --source=<提交号> <文件>` |
| 撤销上一次提交（保留改动） | `git reset --soft HEAD~1` |
| 撤销某次已推送的提交 | `git revert <提交号>` |
| 临时看老版本 | `git switch --detach <提交号>` |

---

## 10. 术语表

| 词 | 含义 |
|---|---|
| **工作区 / Working Tree** | 你眼前能编辑的那些文件 |
| **暂存区 / Index / Stage** | `git add` 之后文件进的地方，`.git/index` |
| **提交 / Commit** | 一次存档，有哈希、作者、说明、父提交 |
| **blob** | 一个文件的内容，用哈希命名 |
| **tree** | 一个目录：文件名 → blob 的映射 |
| **HEAD** | 指针，"我现在站在哪个分支上" |
| **分支 / Branch** | 一个指向提交的引用，本质是个小文本文件 |
| **远程 / Remote** | 另一个仓库，通常叫 `origin` |
| **上游 / Upstream** | 本地分支跟踪的远程分支，`main...origin/main` |
| **快进 / Fast-forward** | 本地没有新提交，直接往前挪指针，不产生合并提交 |
| **合并提交 / Merge Commit** | 有两个 parent 的提交，标记两条线汇合了 |
| **PR / Pull Request** | "我这条分支想合并进 main，请你审一下"的请求 |
| **fetch** | 把远程的东西拿到本地，但不改你的文件 |
| **pull** | `fetch` + `merge`（或 `rebase`） |
| **stash** | 储藏：把未提交的改动临时收起来 |
| **reflog** | 引用日志，记录你每一步操作，救命用的 |

---

## 附录：这次项目的完整命令流水

```powershell
# —— 第一次开发 ——
cd E:\DSH\lianxigit
git init -b main
git config core.quotepath false
git config core.autocrlf false
git config http.sslBackend openssl
git add -A
git commit -m "初始化项目：待办清单页面、样式与交互逻辑"     # bbe6d4d

git remote add origin https://github.com/SIxuanZ/lianxigit.git
git config --global credential.helper manager
git push -u origin main

# —— 第二次开发：筛选功能 ——
git add -A
git commit -m "feat: 新增按状态筛选待办（全部/未完成/已完成）"  # bc5dd53
gitr push

# —— 第三次开发：分支 + PR ——
git switch -c feat/edit-todo
git add -A
git commit -m "feat: 支持双击编辑待办"                          # 955a5f6
gitr push -u origin feat/edit-todo
# GitHub 网页：Compare & pull request → Create → Merge     # 9d95c30
git switch main
gitr pull
```

---

*文档创建于 2026-11-01，对应仓库 https://github.com/SIxuanZ/lianxigit*

# 我的待办清单（lianxigit）

一个用来练习 Git 与 GitHub 的最小项目：纯前端待办清单，不依赖任何框架和服务器。

## 功能

- 添加待办
- 勾选完成 / 取消完成
- 删除单条待办
- 一键清除已完成
- 按「全部 / 未完成 / 已完成」筛选
- 数据保存在浏览器 `localStorage`，刷新、关页面都不会丢

## 运行

直接用浏览器打开 `index.html` 即可（双击文件就能打开）。

如果想用本地服务器打开：

```bash
npx serve .
```

Then open http://localhost:3000 .

## 目录结构

```text
lianxigit/
├── index.html      # 页面结构
├── style.css       # 样式
├── app.js          # 交互逻辑
└── README.md       # 项目说明（就是本文件）
```

## 后续可以做的

- [ ] 支持编辑已有待办
- [x] 按「未完成 / 已完成」筛选
- [ ] 支持拖动排序
- [ ] 导出为 Markdown

## 许可

MIT

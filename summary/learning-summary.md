---
type: learning-summary
title: "Next.js + Drizzle + Supabase 单词后台管理系统"
aliases: ["单词后台管理系统·学习总结"]
tags: [learning, nextjs, drizzle, postgresql, authentication]
source_scope: "danci/README.md 与 my-app 核心实现"
coverage: {deep_read: ["业务说明", "数据库 Schema", "认证与权限", "核心路由"], shallow_read: ["项目清单", "脚手架说明"], supplement: ["首页分流", "管理员列表", "词书页面"], skipped: ["环境变量值", "锁文件", "构建产物", "原始词库"]}
review_status: learning
next_review: null
---

## 一页速览

- [[#学习范围]]
- [[#知识地图]]
- [[#核心知识]]
- [[#重点语法与 API]]
- [[#注释重点解读]]
- [[#面试高频知识]]
- [[#复习卡片]]
- [[#实践与复习计划]]

> [!summary]
> - 项目采用 Next.js App Router、React 19、Drizzle ORM 和 PostgreSQL 驱动构建后台管理系统。
> - 当前已完成管理员数据模型、首位系统管理员注册、登录会话、权限校验和管理员管理骨架。
> - 认证会话使用“浏览器保存随机令牌、数据库只保存令牌哈希”的设计，密码使用带随机盐的 scrypt 哈希。
> - 首页根据管理员数量和当前会话执行 `/signup`、`/signin`、`/books` 三向分流。
> - 单词书页面目前使用前端静态数据，词书表、真实 CRUD、数据清洗和 H5 应用仍未在已读源码中实现。

最小心智模型：**Schema 描述数据 → Drizzle 提供类型安全查询 → Server Action 处理表单 → Cookie 携带会话令牌 → 服务端页面校验身份和角色 → 页面重定向或渲染后台内容。**

## 学习范围

### 深读

- 根目录 `README.md`：产品目标、ORM、Supabase、词库导入设想。
- `lib/db/schema.ts`、`lib/db/index.ts`：管理员与会话表、数据库连接。
- `lib/auth.ts`：密码、令牌、Cookie、当前管理员查询。
- `app/actions/auth.ts`、`app/actions/admin-users.ts`：注册、登录和管理员写操作。
- `app/page.tsx`、`app/admin-users/page.tsx`、`app/books/page.tsx`：入口分流与路由权限。

### 浅读

- `package.json`：确认 Next.js 16、React 19、Drizzle、postgres、Tailwind CSS 4 及数据库脚本。
- `my-app/README.md`：仍为 create-next-app 默认说明，没有补充业务事实。

### 补读

- `components/books-content.tsx`：确认词书管理当前是静态演示数据，而非数据库 CRUD。

### 跳过

- `.env*`：避免读取数据库连接秘密。
- 锁文件、构建产物、依赖目录、迁移快照、静态图片：与学习主线无直接关系。
- `temp/PEPXiaoXue3_1.json`：原始词库较大，本次只总结系统架构，不处理数据内容。

> [!warning]
> 项目未运行，数据库迁移、页面交互和部署状态均未验证。

## 知识地图

```mermaid
flowchart LR
  Browser[浏览器表单] --> Action[Next.js Server Action]
  Action --> Auth[认证与权限函数]
  Auth --> ORM[Drizzle ORM]
  ORM --> PG[(PostgreSQL / Supabase)]
  Auth --> Cookie[HttpOnly Cookie]
  Cookie --> Page[服务端页面]
  Page --> Route{身份与角色}
  Route --> Signup[/signup]
  Route --> Signin[/signin]
  Route --> Books[/books]
  Route --> Admins[/admin-users]
```

关键调用链：

1. `/` 并行查询管理员总数和当前会话。
2. 管理员总数为 0 时进入首位系统管理员注册。
3. 注册或登录成功后创建数据库会话并设置 Cookie。
4. 受保护页面调用 `getCurrentAdmin()`；无有效会话则跳转登录。
5. 管理员管理页面进一步要求 `system` 角色。

## 核心知识

### 1. 用 Drizzle Schema 映射 PostgreSQL 表

`admin_users` 保存账号、密码哈希、角色、启用状态和时间字段；`admin_sessions` 保存用户外键、令牌哈希和过期时间。Drizzle 的 `$inferSelect` 从表结构推导 TypeScript 查询结果类型，减少数据库结构和应用类型之间的重复定义。

容易混淆：ORM 不是“不需要数据库设计”，而是把表、约束、索引和查询表达为代码。唯一约束、外键级联和过期时间索引仍需要明确设计。

### 2. 数据库连接只存在于服务端

数据库模块引入 `server-only`，并从 `DATABASE_URL` 建立 postgres 客户端，再交给 Drizzle。`prepare: false` 常用于兼容事务池或代理连接；其是否为当前 Supabase 连接的必要条件，需要结合实际连接方式验证。

### 3. 首位系统管理员必须处理并发

注册流程不是简单地“先 count，再 insert”。代码在事务中获取 PostgreSQL advisory transaction lock，然后检查管理员总数，确保并发请求下只有一个请求能创建首位系统管理员。

这是项目最有价值的实现细节之一：**业务唯一性不能只依赖页面是否显示注册入口，还要在数据库事务边界内保证。**

### 4. 密码与会话令牌采用不同哈希策略

密码使用随机盐 + scrypt，因为密码熵低，需要计算成本抵抗暴力破解；随机会话令牌本身熵高，数据库中保存 SHA-256 哈希即可降低数据库泄露后令牌被直接利用的风险。密码比较使用 `timingSafeEqual`。

### 5. Cookie 与数据库会话共同完成认证

浏览器 Cookie 保存原始随机令牌，并设置 `httpOnly`、`sameSite=lax`、生产环境 `secure`。数据库只保存令牌哈希和过期时间。读取会话时对 Cookie 令牌哈希，再联表查询有效、未过期且启用的管理员。

### 6. 认证与授权分层

- 认证：`getCurrentAdmin()` 判断“是谁”。
- 授权：`requireSystemAdmin()` 或页面角色判断决定“能做什么”。
- 写操作再次鉴权：创建、修改管理员的 Server Action 不信任前端页面，内部重新检查系统管理员身份。

### 7. 当前词书功能仍是界面原型

`BooksContent` 在客户端维护搜索状态，并过滤静态数组。页面具备列表、状态、搜索、筛选和分页外观，但没有词书 Schema、数据库查询或 Server Action。因此不能把它描述为已经完成真实单词书 CRUD。

## 重点语法与 API

- `[材料中出现]` `pgTable`、`pgEnum`：声明 PostgreSQL 表和枚举。
- `[材料中出现]` `.references(..., { onDelete: "cascade" })`：定义外键及级联删除。
- `[材料中出现]` `db.transaction()`：把锁、检查和插入放入同一事务。
- `[材料中出现]` ``sql`select pg_advisory_xact_lock(...)` ``：执行 Drizzle 高层 API 未直接封装的 SQL。
- `[材料中出现]` `db.select().from().innerJoin().where().limit()`：组合类型安全查询。
- `[材料中出现]` `cookies()`：在服务端读取和写入 Cookie。
- `[材料中出现]` `redirect()`：服务端页面按状态终止当前渲染并跳转。
- `[材料中出现]` `revalidatePath()`：写操作后使指定路由的数据重新验证。
- `[材料中出现]` `Promise.all()`：并行执行首页互不依赖的管理员计数与会话查询。
- `[材料推导]` Server Action 不能只依赖 UI 隐藏按钮完成授权，必须在服务端函数内部鉴权。

## 注释重点解读

未发现可解释性源码注释。当前实现主要依靠函数名和结构表达意图。建议学习时重点追踪事务边界、Cookie 生命周期、角色判断和页面重定向，而不是依赖注释理解。

## 面试高频知识

### 为什么密码不能直接用 SHA-256？`[材料推导]`

密码熵低，快速哈希便于攻击者高吞吐尝试；scrypt 通过内存和计算成本提高暴力破解代价，并配合随机盐抵抗彩虹表。

### Session 与 JWT 有什么差异？`[外部补充]`

本项目使用有状态 Session：服务端可以删除数据库记录实现即时注销和撤销，代价是每次鉴权通常需要访问数据库。JWT 常用于无状态验证，但撤销和权限即时变化处理更复杂。

### 为什么页面鉴权后，Server Action 还要鉴权？`[材料中出现]`

客户端界面和页面路由都不是可信安全边界。攻击者可以直接构造请求调用服务端写入口，因此写操作必须独立验证当前身份和角色。

### advisory lock 解决什么问题？`[材料中出现]`

它序列化竞争同一业务资源的事务，避免两个并发注册请求都观察到“管理员数量为 0”。锁只在事务期间持有，不替代一般的数据约束设计。

### 索引为什么放在会话用户和过期时间上？`[材料推导]`

用户外键索引有利于按管理员查会话；过期时间索引有利于清理过期会话。实际查询还按 `token_hash` 查询，而该字段的唯一约束通常会形成唯一索引。

## 复习卡片

> [!tip]
> 先口述“注册 → 哈希密码 → 事务锁 → 插入系统管理员 → 创建会话 → 写 Cookie”的完整链路，再回看代码。

1. **Q：`admin_users` 与 `admin_sessions` 是什么关系？** A：一对多，会话删除不影响用户，用户删除会级联删除会话。
2. **Q：Cookie 中保存什么？** A：随机原始令牌；数据库保存其 SHA-256 哈希。
3. **Q：如何判断会话有效？** A：令牌哈希匹配、未过期、关联管理员处于启用状态。
4. **Q：谁能创建普通管理员？** A：通过 `requireSystemAdmin()` 校验的系统管理员。
5. **Q：为什么首位管理员注册需要事务锁？** A：防止并发创建多个系统管理员。
6. **Q：首页为何是动态页面？** A：重定向依赖实时数据库计数和 Cookie 会话。
7. **Q：当前词书搜索在哪里执行？** A：客户端对静态数组执行 `useMemo` 过滤。
8. **Q：ORM 是否完全消除 SQL？** A：否，复杂能力仍可通过原生 SQL 使用，数据库约束仍需设计。

> [!warning]
> 易混淆：`role === "system"` 是授权；存在合法 Session 是认证。两者不能互相替代。

## 实践与复习计划

- [ ] 当天：画出 `admin_users`、`admin_sessions` 的关系图，并口述登录链路。
- [ ] 1 天后：不看源码写出 `hashPassword`、`verifyPassword` 和会话查询的伪代码。
- [ ] 3 天后：解释没有 advisory lock 时首位管理员注册可能出现的竞态。
- [ ] 7 天后：为词书功能设计最小 `books` 表和增删改查 Server Action，再与当前静态页面对接。

> [!question]
> - Supabase 使用直连、Session Pooler 还是 Transaction Pooler？
> - 初始迁移是否已在云端执行？
> - 词书、单词、词书与单词关系准备采用什么数据模型？
> - 词库 JSON 的字段质量、去重规则和审核流程是什么？
> - H5 应用与后台是否共享同一 Next.js 工程和数据库模型？

结论边界：以上架构与行为来自已读源码；部署状态、实际运行效果和未实现模块均标为未知或未验证。

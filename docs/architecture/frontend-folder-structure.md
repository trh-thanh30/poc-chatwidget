# Frontend Folder Structure

Tài liệu này định nghĩa cấu trúc và rule frontend cho POC Chat Widget. Nó áp dụng cho:

- `apps/widget`: embeddable React runtime, build thành IIFE `widget.js`.
- `apps/demo`: website host độc lập dùng để kiểm tra integration và CSS isolation.

Mục tiêu là giữ Widget nhỏ, độc lập với host page và đủ rõ để các vertical slice tiếp theo có
thể thêm Axios, TanStack Query và shadcn/ui mà không phá Shadow DOM boundary.

## Technology Inventory

### Đã được cài đặt

| Area       | Package/Tool                   | Vai trò                              |
| ---------- | ------------------------------ | ------------------------------------ |
| UI runtime | React 19, React DOM 19         | Component tree bên trong Shadow Root |
| Build      | Vite 7, `@vitejs/plugin-react` | Build IIFE và demo dev server        |
| Language   | TypeScript 5.9                 | Strict type checking                 |
| Tests      | Vitest 4, jsdom 27             | Component/bootstrap behavior         |
| Workspace  | pnpm 10, Turborepo             | Dependency và dev orchestration      |

### Đã chọn nhưng chưa cài trong task hiện tại

| Package        | Task dự kiến                                | Rule khi thêm                                                    |
| -------------- | ------------------------------------------- | ---------------------------------------------------------------- |
| Axios          | Chat API slice                              | Một configured client, không gọi Axios rải rác trong component   |
| TanStack Query | Chat API slice                              | Server state, mutation, polling và retry policy                  |
| shadcn/ui      | Khi UI cần primitive mới                    | Copy source tối thiểu vào Widget; không kéo nguyên design system |
| Tailwind CSS   | Nếu shadcn cần                              | CSS build phải inject vào Shadow Root, không vào `document.head` |
| Zod            | Shared contracts nếu cần runtime validation | Schema ở package framework-neutral hoặc feature sở hữu           |

Không viết tài liệu như thể các package trong bảng thứ hai đã tồn tại. Khi thêm package, cập nhật
inventory trong cùng change set.

## Current Folder Tree

```text
apps/widget/
├── src/
│   ├── entry.tsx
│   ├── mount-widget.tsx
│   ├── mount-widget.test.tsx
│   ├── widget.tsx
│   └── styles.css
├── package.json
├── tsconfig.json
└── vite.config.ts

apps/demo/
├── src/
│   ├── main.ts
│   └── styles.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Runtime Flow

```text
host HTML
  -> deferred widget.js
  -> entry.tsx reads document.currentScript.dataset
  -> mount-widget.tsx checks singleton host ID
  -> create host element
  -> attach open Shadow Root
  -> append inline <style> + React mount point
  -> render widget.tsx
```

Mỗi bước có một trách nhiệm riêng. Không gộp bootstrap DOM logic vào presentation component.

## `apps/widget` Roles

### `src/entry.tsx`

Entrypoint của artifact IIFE.

Được phép:

- Đọc `document.currentScript` ngay khi script execute.
- Đọc `data-widget-id`, `data-api-url` và public embed attributes.
- Gọi một bootstrap/mount function.

Không được phép:

- Chứa JSX UI lớn.
- Gọi Chat API trực tiếp.
- Tạo query client hoặc business state.
- Ghi global variable tùy ý vào `window`.

`document.currentScript` có thể không còn đúng sau async boundary, vì vậy phải capture config
đồng bộ trước mọi promise/timer.

### `src/mount-widget.tsx`

Integration boundary giữa host page và React.

Trách nhiệm:

- Bảo đảm chỉ một host element tồn tại.
- Tạo Shadow Root.
- Inject CSS text vào Shadow Root.
- Tạo/unmount React root.
- Nhận `Document` dependency khi test.

Không đưa message state, API state hoặc visual decisions vào file này.

### `src/widget.tsx`

Composition root cho UI hiện tại.

Trách nhiệm hiện tại:

- Launcher state.
- Panel open/close behavior.
- Keyboard Escape và focus restoration.
- Missing Widget ID state.
- Preview composer bị disable đúng scope task.

Khi chat feature phát triển, `widget.tsx` chỉ nên compose provider và feature component. Không để
file này trở thành component lớn chứa API, list rendering và channel logic.

### `src/styles.css`

CSS chỉ dành cho Shadow Root.

Rules:

- Token riêng dùng prefix `--cw-`.
- Reset chỉ scope dưới `:host`/Shadow Root.
- Không dùng selector áp vào `html`, `body` hoặc host document.
- Animation phải tôn trọng `prefers-reduced-motion`.
- Interactive target chính nên đạt tối thiểu khoảng 44×44 px.
- Responsive breakpoint phải kiểm tra viewport hẹp và chiều cao thấp.
- Tránh phụ thuộc `rem` cho geometry quan trọng nếu host page có thể thay root font size.
- Không tạo nhiều z-index tùy ý bên trong Widget.

### `vite.config.ts`

Build contract hiện tại:

- Format: IIFE.
- Stable output: `dist/widget.js`.
- React/ReactDOM bundle cùng artifact.
- Dynamic imports được inline.
- `process.env.NODE_ENV` được cố định là production để loại dev branch của React.
- Preview server bật CORS cho cross-origin script development.

Không đổi filename/hash strategy nếu chưa cập nhật integration guide và cache/deploy strategy.

## Target Structure Khi Chat Feature Xuất Hiện

Không tạo trước các folder rỗng. Khi `POC-CHATWIDGET-004` bắt đầu, cấu trúc mục tiêu là:

```text
apps/widget/src/
├── bootstrap/
│   ├── read-embed-config.ts
│   └── mount-widget.tsx
├── components/
│   └── ui/                  # shadcn primitives thật sự được dùng
├── features/
│   └── chat/
│       ├── api/
│       │   ├── chat.api.ts
│       │   └── chat.keys.ts
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── chat-panel.tsx
├── lib/
│   ├── http-client.ts
│   └── query-client.ts
├── styles/
│   ├── tokens.css
│   └── widget.css
├── entry.tsx
└── widget.tsx
```

Chỉ tách `bootstrap/` hoặc `styles/` khi có ít nhất hai file cùng trách nhiệm. Một file duy nhất
được giữ ở root để tránh folder nông không cần thiết.

## State Ownership

| State                 | Owner                                            |
| --------------------- | ------------------------------------------------ |
| Panel open/close      | React local state                                |
| Draft message         | Chat feature local state                         |
| Session bootstrap     | TanStack Query hoặc bootstrap hook khi được thêm |
| Message list          | TanStack Query cache                             |
| Send mutation         | TanStack Query mutation                          |
| Poll/retry status     | TanStack Query policy                            |
| Embed config          | Immutable bootstrap config                       |
| Cross-tab persistence | Không thêm nếu acceptance criteria chưa yêu cầu  |

Không thêm Zustand/Jotai/Redux cho state hiện tại. Global store chỉ hợp lý khi state thật sự dùng
xuyên nhiều feature độc lập.

## Axios and TanStack Query Rules

Khi các package được thêm:

```text
React component
  -> feature hook
  -> TanStack Query query/mutation
  -> chat API function
  -> configured Axios client
  -> NestJS API
```

- Component không import Axios trực tiếp.
- Axios interceptor chỉ chuẩn hóa transport/auth/error; không chứa UI behavior.
- Query key định nghĩa tập trung trong feature.
- Retry GET/poll có kiểm soát; không retry send-message mutation mù quáng.
- `429` phải đọc `Retry-After` và chuyển thành UI state rõ ràng.
- Query cache không được chia sẻ qua global host page.
- QueryClient được tạo bên trong Widget runtime, không lấy instance của host.

## shadcn/ui and Shadow DOM

shadcn/ui là source component, không phải một runtime package duy nhất.

Rules khi thêm:

- Chỉ add component thực sự dùng, ví dụ Button, Textarea, ScrollArea.
- Component source thuộc `apps/widget/src/components/ui/` vì chỉ Widget sử dụng.
- Radix portal phải nhận container trong Shadow Root; portal vào `document.body` sẽ phá style
  isolation.
- Tailwind output phải trở thành CSS text được inject vào Shadow Root.
- Không dùng plugin chỉ inject CSS vào `document.head`.
- Theme token map về `--cw-*`; không phụ thuộc biến `:root` của host.
- Review bundle size sau mỗi primitive có dependency lớn.

Chỉ chuyển primitive lên `packages/ui` khi có ít nhất hai app thật sự cùng consume và package có
chiến lược CSS/Shadow DOM rõ ràng.

## `apps/demo` Rules

Demo là consumer độc lập.

- Tải artifact qua `<script src="http://localhost:4173/widget.js">`.
- Không import `apps/widget/src/*`.
- Giữ hostile CSS selectors cho `button`, `textarea` và universal box model.
- Có thể thêm allowed/blocked origin pages ở task domain restriction.
- Không mô phỏng backend rule chỉ bằng client JavaScript.
- Runtime status chỉ hỗ trợ demo, không trở thành contract của Widget.

## Accessibility

- Launcher phải có accessible name và `aria-expanded`.
- Panel dùng dialog semantics phù hợp.
- Khi mở panel, focus chuyển đến control hợp lý; khi đóng, focus trở về launcher.
- Escape đóng panel.
- Icon-only button phải có `aria-label`.
- Error, rate-limit và offline state phải được announce nhưng không spam live region.
- Không truyền đạt status chỉ bằng màu.
- Mobile input font không nhỏ hơn 16 px nếu có nguy cơ browser zoom.
- Motion chỉ dùng transform/opacity và có reduced-motion fallback.

## Testing Strategy

### Unit/component tests

- Embed config parsing.
- Singleton mount.
- Open/close/focus/Escape behavior.
- Missing configuration state.
- Message rendering và safe text handling khi feature được thêm.

### Integration/browser tests

- Load built `widget.js`, không load source module.
- Host CSS collision.
- Duplicate script tags.
- Desktop/mobile viewport.
- API offline và slow response.
- Allowed/disallowed origin khi backend hỗ trợ.

jsdom test chứng minh React/DOM behavior nhưng không chứng minh visual CSS isolation hoàn toàn;
browser smoke/E2E test vẫn cần thiết.

## Dependency Placement

| Dependency                 | Nơi khai báo                           |
| -------------------------- | -------------------------------------- |
| React/Vite/Widget-only UI  | `apps/widget/package.json`             |
| Demo-only tooling          | `apps/demo/package.json`               |
| Shared TS config           | `packages/typescript-config`           |
| Cross-app runtime contract | Package riêng chỉ khi có consumer thật |

Không đặt mọi dependency ở root. Root giữ workspace-quality tooling; app giữ runtime dependency
của chính nó.

## Anti-patterns

- Inject Widget CSS vào `document.head`.
- Import source Widget trực tiếp vào demo.
- Gọi Axios trong JSX component.
- Dùng host page React, query client hoặc CSS variables ngầm định.
- Portal ra `document.body` mà không kiểm soát container.
- Tạo package UI chung chỉ cho một consumer.
- Lưu Widget ID như secret.
- Retry send-message không có idempotency.
- Thêm global store cho launcher state đơn giản.

## Frontend Change Checklist

- [ ] Đọc ADR Shadow DOM và embed integration guide.
- [ ] Dùng đúng layer/folder sở hữu behavior.
- [ ] Không làm thay đổi public embed contract ngoài scope.
- [ ] Kiểm tra keyboard, focus, accessible name và reduced motion.
- [ ] Kiểm tra desktop/mobile và hostile host CSS.
- [ ] Review bundle size nếu thêm dependency.
- [ ] Thêm/cập nhật tests theo observable behavior.
- [ ] Chạy `pnpm lint`, `pnpm check-types`, `pnpm test`, `pnpm build`.

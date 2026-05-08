# Plan: CareerExplorer — Replace careerAI with Wizard + Galaxy Map Experience

## Summary
Thay thế tính năng `careerAI` hiện tại (chat-based) trên route `/career-ai` bằng một trải nghiệm khám phá nghề nghiệp 4 phase theo phong cách Google Labs Career Dreamer: **Wizard** (role → org → tasks → skills) → **Identity** (Career Identity Statement) → **Galaxy** (constellation map các nghề) → **Detail** (snap-scroll 4 section). Mỗi phase gọi 1 endpoint AI riêng (Gemini structured JSON), tận dụng `getUserProfile()` để cá nhân hoá, và CTA cuối liên kết với `/jobs?keyword=...` để chuyển từ khám phá sang hành động.

## User Story
As a job seeker hoặc sinh viên đang phân vân hướng nghề,
I want một flow khám phá có cấu trúc (wizard → bản đồ nghề → chi tiết) thay vì chat tự do,
So that tôi nhận được hồ sơ nghề nghiệp được AI tổng hợp + 8-10 lộ trình nghề trực quan trên galaxy map + chi tiết để hành động ngay trên KORRA.

## Problem → Solution
Current state: `/career-ai` là chatbot multi-turn với Gemini → kết quả là 3 ResultCard. Người dùng phải tự nghĩ ra mô tả mở đầu, không thấy "bản đồ" hệ sinh thái nghề, không có Career Identity Statement.
Desired state: Wizard có hướng dẫn từng bước, AI sinh tasks/skills cho người dùng tick chọn (giảm tải cognitive), tạo Identity Statement có thể edit, hiển thị galaxy 8-10 nghề (database + AI suggestion), snap-scroll detail (Tổng quan / Điểm mạnh / Ngày làm việc / Khoá học), CTA "Tìm việc phù hợp" mở `/jobs?keyword=...`.

## Metadata
- **Complexity**: Large
- **Source PRD**: `.agent/PRPs/prds/ai-career-prediction.prd.md` (V1 đã ship — đây là thế hệ V2 thay thế Phase 4 frontend + mở rộng backend AI)
- **PRD Phase**: standalone (V2 redesign)
- **Estimated Files**: 18 files (12 create, 6 update, ~5 delete)

---

## UX Design

### Before
```
┌──────────────────────────────────────────────────┐
│  AppHeader [✦ Career AI]                          │
│                                                    │
│   ┌────────────────────────────────────────┐     │
│   │ HERO: "Khám phá nghề nghiệp cùng AI"    │     │
│   │ Quick start chips (5 lựa chọn)         │     │
│   └────────────────────────────────────────┘     │
│                                                    │
│   [Chat bubbles - user/AI alternating]            │
│   [Option chips after each AI message]            │
│   [Input bar 500 ký tự]                           │
│   [3 ResultCard với "Tìm việc liên quan"]         │
└──────────────────────────────────────────────────┘
```

### After
```
PHASE 1 — WIZARD (4 step, snap)
┌──────────────────────────────────────────────────┐
│  AppHeader [✦ Career Explorer]                    │
│                                                    │
│   👋 Bạn từng làm vị trí nào?                     │
│   [Lập trình viên________________] (32px input)   │
│                              [Tiếp theo →]        │
└──────────────────────────────────────────────────┘
   ↓
┌──────────────────────────────────────────────────┐
│   Lập trình viên                                  │
│   [VNG / Công nghệ thông tin (tuỳ chọn)_______]   │
│   [← Quay lại]                  [Tiếp theo →]    │
└──────────────────────────────────────────────────┘
   ↓
┌──────────────────────────────────────────────────┐
│   Lập trình viên                                  │
│   ✦ Đang tạo danh sách nhiệm vụ...               │
│   ☑ Thiết kế và phát triển tính năng mới         │
│   ☑ Viết code sạch, dễ bảo trì                   │
│   ☐ Review code                                   │
│   ...                                             │
└──────────────────────────────────────────────────┘
   ↓
┌──────────────────────────────────────────────────┐
│   Lập trình viên   [6 nhiệm vụ]                  │
│   Chọn ít nhất 3 kỹ năng                          │
│   [Lập trình] [Cấu trúc dữ liệu] [Thuật toán]…   │
└──────────────────────────────────────────────────┘

PHASE 2 — IDENTITY (split-pane)
┌──────────────────────────────────────────────────┐
│  Left: Profile sections        Right: ✦ Career   │
│  🌱 Kinh nghiệm                Identity Statement│
│  🎓 Học vấn                    "Tôi phát triển  │
│  💪 Kỹ năng                    các giải pháp..."│
│                                [Khám phá nghề →]│
└──────────────────────────────────────────────────┘

PHASE 3 — GALAXY (constellation)
┌──────────────────────────────────────────────────┐
│ ← Quay lại                    [Preview panel]    │
│                                Lập trình viên    │
│        ◯ PM           ◯ Data    💰 25-45 tr/th  │
│  ◯ Full   🌱💪         ◯ ML    [Xem chi tiết→] │
│  stack    Khám phá              ...              │
│           nghề                                   │
│  ◯ Backend     ◯ Cloud                           │
│  ◯ Frontend ◯ Security ◯ Mobile                  │
│ [Legend: ● database  ● AI gợi ý]                 │
└──────────────────────────────────────────────────┘

PHASE 4 — DETAIL (snap-scroll 4 section)
┌──────────────────────────────────────────────────┐
│ ← Back                  [Tìm việc phù hợp ↗]    │
│                                                    │
│        Hãy tưởng tượng bạn là:                    │
│        Lập trình viên Fullstack                  │
│                                                    │
│  ●○○○  Tổng quan • Điểm mạnh • Ngày • Học        │
│                                                    │
│  [Card section dựa trên section index]            │
│  [← Trước]                       [Tiếp →]        │
└──────────────────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Vào `/career-ai` | Hero + chat input | Wizard step 0 (nhập role) | Auto-redirect nếu chưa login (giữ nguyên) |
| Tạo nội dung AI | 1 endpoint `/career-predict` chat | 5 endpoint riêng cho từng phase | Mỗi endpoint có prompt + JSON schema riêng |
| Quick start | 5 prompt chip | Không còn (wizard trực quan thay thế) | — |
| Kết quả cuối | 3 ResultCard | Galaxy 8-10 nodes + click → DetailPhase 4 section | UX nhiều thông tin hơn |
| CTA "Tìm việc" | mỗi card 1 nút | 1 nút trên DetailPhase header | Sử dụng `searchKeyword` AI sinh ra |
| Export context | nút copy + Gemini/ChatGPT shortcut | (REMOVED V2) | Giảm scope; có thể thêm lại sau |
| Conversation history | giữ trong state | Không cần (wizard linear) | Đơn giản hoá |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `docs/CareerExplorer.jsx` | 1-678 | Reference implementation — toàn bộ luồng UI, state machine, mock API contract |
| P0 | `backend/src/services/aiService.js` | 1-143 | Pattern Gemini → fallback, system prompt, JSON parse, tách prompt theo phase từ đây |
| P0 | `backend/src/services/providers/geminiProvider.js` | 1-33 | Gemini config: `responseMimeType: 'application/json'`, `temperature 0.8`, model env |
| P0 | `backend/src/controllers/aiController.js` | 1-122 | Pattern controller: `buildProfileContext`, error mapping, `next(err)` |
| P0 | `backend/src/routes/aiRoutes.js` | 1-15 | Pattern route + `router.use(authMiddleware.verifyToken)` |
| P0 | `client/src/pages/CareerAI/CareerAI.jsx` | 1-315 | File sẽ bị thay thế — đọc để hiểu hiện trạng và tránh regression nav/auth |
| P0 | `client/src/App.jsx` | 1-52 | Pattern routing — route `/career-ai` cần giữ nguyên path |
| P1 | `client/src/components/AppHeader/AppHeader.jsx` | 67-80 | NavLink hiện tại key `career-ai` label "✦ Career AI" — đổi label thành "Career Explorer" |
| P1 | `client/src/services/jobService.js` | 1-69 | Pattern service: BASE_URL, fetch, throw on !ok, `result.data` |
| P1 | `client/src/services/notificationService.js` | 1-35 | Pattern service nhỏ gọn — dùng làm khuôn cho `careerExplorerService.js` |
| P1 | `backend/src/repositories/userRepository.js` | 48-100 | `getUserProfile` — đã trả về skills/experiences/education/certifications |
| P1 | `backend/src/middlewares/errorMiddleware.js` | 1-39 | Hiểu `isOperational` flag và format error response |
| P1 | `backend/src/utils/errors.js` | 1-43 | Class `AppError`, `BadRequestError` — dùng cho validate input |
| P2 | `client/src/index.css` | 1-100 | Design tokens — dùng `text-primary` (#6C7EE1), `bg-primary/10`, font Be Vietnam Pro |
| P2 | `.claude/PRPs/plans/completed/notification-feature.plan.md` | 1-200 | Reference plan style — cách trình bày plan phong phú nhất trong project |
| P2 | `.agent/PRPs/prds/ai-career-prediction.prd.md` | 1-241 | PRD gốc — context "explainable AI", target user "học sinh/SV", LLM strategy Gemini → Ollama |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Google Gemini structured output | https://ai.google.dev/gemini-api/docs/structured-output | `responseMimeType: 'application/json'` + `responseSchema` đảm bảo JSON đúng schema. Hiện tại codebase chỉ dùng `responseMimeType` không có schema → giữ nguyên approach để không vỡ pattern, nhưng có thể bổ sung schema để giảm tỷ lệ parse fail |
| `@google/genai` v1.49 API | Already used in `geminiProvider.js` | `client.models.generateContent({ model, contents, config })` — config nằm trong `config`, không phải top-level |
| React 19 + Vite (rolldown-vite) | Project uses `rolldown-vite@7.2.5` | Build với `npm run build`, dev với `npm run dev` (port 5173, proxy `/v1` → port 3000) |
| Tailwind 4 `@theme` block | `client/src/index.css:3-46` | Design tokens định nghĩa qua CSS custom properties, dùng `text-primary` thay vì `text-[#6C7EE1]` |

KEY_INSIGHT: Codebase hiện tại không có vector DB hay embedding — galaxy `careerPaths` 100% sinh từ LLM (không phải truy vấn từ Job nodes). `type: 'db' | 'ai'` chỉ là metadata để LLM tự gắn nhãn cho legend.
APPLIES_TO: Phase 3 backend `/v1/ai/career-paths` — không cần truy vấn Neo4j, chỉ inject context từ identity statement.
GOTCHA: Ollama fallback hiện tại trả mock options khi Gemini fail — pattern này KHÔNG phù hợp cho 5 endpoint mới (cần mock theo schema từng endpoint). Cần wrapper riêng cho từng phase hoặc throw lên client cho UX show error rõ ràng.

KEY_INSIGHT: Project KHÔNG có test runtime hoạt động (no `*.test.*` files, `setupTests.js` không tồn tại, backend `npm test` exit 1, client có vitest cấu hình nhưng chưa setup).
APPLIES_TO: Validation strategy — không thể chạy unit test. Phải dùng manual + `npm run lint` + `npm run build` + `node test_api.js` style.
GOTCHA: Đừng tạo file test giả — chỉ thêm khi user yêu cầu hoặc khi infrastructure test được dựng lên.

---

## Patterns to Mirror

### NAMING_CONVENTION_BACKEND
```js
// SOURCE: backend/src/controllers/aiController.js:1-3
const aiService = require('../services/aiService');
const userRepository = require('../repositories/userRepository');

// SOURCE: backend/src/controllers/aiController.js:48
const careerPredict = async (req, res, next) => { /* ... */ };

// SOURCE: backend/src/controllers/aiController.js:121
module.exports = { careerPredict, exportContext };
```
- File: `camelCase.js` (`aiController.js`, `aiService.js`)
- Function: `camelCase` arrow functions, `async (req, res, next) =>`
- Export: CommonJS `module.exports = { name1, name2 }`
- Khi 1 file có nhiều handler liên quan: NEW handlers `generateTasks`, `generateSkills`, `generateIdentity`, `generateCareerPaths`, `generateCareerDetail` đặt cùng `aiController.js`

### NAMING_CONVENTION_FRONTEND
```jsx
// SOURCE: client/src/pages/CareerAI/CareerAI.jsx:34
const CareerAI = () => { /* ... */ };
export default CareerAI;

// SOURCE: client/src/components/CareerAI/ChatBubble.jsx:93
const ChatBubble = ({ role, text, isError = false }) => { /* ... */ };
```
- Page: `PascalCase.jsx` trong `pages/<FeatureName>/<FeatureName>.jsx`
- Component: `PascalCase.jsx` trong `components/<FeatureName>/<ComponentName>.jsx`
- Service: `camelCase.js` trong `services/<feature>Service.js`
- Default export, single component per file

### CONTROLLER_PATTERN
```js
// SOURCE: backend/src/controllers/aiController.js:48-102
const careerPredict = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { message, conversationHistory = [] } = req.body;

    // 1. Input validation
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Tin nhắn không được để trống.' });
    }

    // 2. Load context
    const profile = await userRepository.getUserProfile(userId);
    const profileContext = buildProfileContext(profile);

    // 3. Call service
    const aiResponse = await aiService.chat(profileContext, updatedHistory);

    // 4. Standard response envelope
    res.status(200).json({ success: true, data: aiResponse });
  } catch (err) {
    // Specific AI error mapping
    if (err.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(503).json({ success: false, error: 'Hệ thống AI đang quá tải...' });
    }
    next(err);
  }
};
```

### ROUTE_PATTERN
```js
// SOURCE: backend/src/routes/aiRoutes.js:1-15
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.verifyToken); // protect all AI routes
router.post('/career-predict', aiController.careerPredict);
module.exports = router;
```

### LLM_PROVIDER_PATTERN
```js
// SOURCE: backend/src/services/providers/geminiProvider.js:10-31
const chat = async (messages) => {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const contents = messages.map(m => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.text }]
  }));

  const response = await client.models.generateContent({
    model,
    contents,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.8,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  });
  return response.text;
};
```

### LLM_SERVICE_FALLBACK_PATTERN
```js
// SOURCE: backend/src/services/aiService.js:69-94
const chat = async (profileContext, conversationHistory) => {
  const messages = buildMessages(profileContext, conversationHistory);
  let rawText = '';
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('No Gemini API Key configured');
    rawText = await geminiProvider.chat(messages);
  } catch (geminiError) {
    console.error('[aiService] Gemini API Error Details:', { /* ... */ });
    // Fallback: mock response (NOT Ollama in current code despite PRD claim)
    rawText = JSON.stringify({ /* phase-appropriate mock */ });
  }
  // Parse + validate JSON
  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
};
```
GOTCHA: PRD claims "Gemini → Ollama fallback" nhưng code thật chỉ có **mock fallback**. Plan này giữ nguyên hành vi hiện tại (mock fallback) cho V2 để không phải đụng Ollama infrastructure.

### NEO4J_REPO_PATTERN (chỉ dùng nếu sau này muốn link career → real jobs)
```js
// SOURCE: backend/src/repositories/jobRepository.js:3-21
const getAllJobs = async (filters = {}) => {
  const session = driver.session();
  try {
    let query = `MATCH (j:Job)-[:BELONGS_TO]->(c:Company) WHERE j.status = 'ACTIVE'`;
    const params = {};
    // ... build dynamic query ...
    const result = await session.run(query, params);
    return result.records.map(record => ({ ... }));
  } finally {
    await session.close();
  }
};
```

### FRONTEND_SERVICE_PATTERN
```js
// SOURCE: client/src/services/notificationService.js:1-15
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/v1/notifications`;

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const fetchNotifications = async (token, limit = 20, skip = 0) => {
  const res = await fetch(`${API_URL}?limit=${limit}&skip=${skip}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};
```

### PAGE_AUTH_GUARD_PATTERN
```jsx
// SOURCE: client/src/pages/CareerAI/CareerAI.jsx:34-56
const CareerAI = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  if (!token) return null;
  // ... render
};
```

### TAILWIND_COLOR_TOKENS
```jsx
// SOURCE: client/src/index.css:5-29 (consume via Tailwind classes)
// Use: text-primary, bg-primary, border-primary, bg-primary/10, text-primary-dark
// NOT inline #1a73e8 from reference file — re-skin with project tokens.
```

### ERROR_RESPONSE_ENVELOPE
```js
// All controllers return this shape (success path):
{ success: true, data: <payload>, message?: string }
// Error path (controller-handled):
{ success: false, error: 'Vietnamese user-facing message' }
// Error path (next(err) → globalErrorHandler):
{ status: 'fail'|'error', message: string }
```

---

## Files to Change

### Backend
| File | Action | Justification |
|---|---|---|
| `backend/src/services/aiService.js` | UPDATE | Tách prompt theo phase: thêm `generateTasks`, `generateSkills`, `generateIdentityStatement`, `generateCareerPaths`, `generateCareerDetail`. Giữ nguyên `chat` legacy (không dùng nữa nhưng để tránh vỡ legacy nếu có ai gọi) hoặc xoá nếu chắc. **Khuyến nghị: xoá** vì controller `careerPredict` cũng sẽ bị xoá. |
| `backend/src/controllers/aiController.js` | UPDATE | Xoá `careerPredict`, `exportContext`. Thêm 5 handler mới: `generateTasks`, `generateSkills`, `generateIdentity`, `generateCareerPaths`, `generateCareerDetail`. Giữ helper `buildProfileContext`. |
| `backend/src/routes/aiRoutes.js` | UPDATE | Xoá 2 route cũ. Thêm 5 route mới: POST `/career-tasks`, `/career-skills`, `/career-identity`, `/career-paths`, `/career-detail`. |

### Frontend (delete + create)
| File | Action | Justification |
|---|---|---|
| `client/src/pages/CareerAI/CareerAI.jsx` | DELETE | Replaced by `CareerExplorer.jsx` (rename for clarity) |
| `client/src/components/CareerAI/ChatBubble.jsx` | DELETE | Chat UI no longer needed |
| `client/src/components/CareerAI/OptionChips.jsx` | DELETE | Chip pattern moved into Wizard component |
| `client/src/components/CareerAI/ResultCard.jsx` | DELETE | Replaced by Galaxy node + DetailPhase |
| `client/src/components/CareerAI/ContextExporter.jsx` | DELETE | Out of V2 scope |
| `client/src/pages/CareerAI/CareerExplorer.jsx` | CREATE | Main 4-phase orchestrator |
| `client/src/pages/CareerAI/phases/WizardPhase.jsx` | CREATE | Wizard step 0-3 (role / org / tasks / skills) |
| `client/src/pages/CareerAI/phases/IdentityPhase.jsx` | CREATE | Profile + Identity Statement split |
| `client/src/pages/CareerAI/phases/GalaxyPhase.jsx` | CREATE | Constellation map 8-10 careers |
| `client/src/pages/CareerAI/phases/DetailPhase.jsx` | CREATE | Snap-scroll 4 section detail |
| `client/src/pages/CareerAI/components/Btn.jsx` | CREATE | Shared primary/secondary button |
| `client/src/pages/CareerAI/components/Chip.jsx` | CREATE | Shared chip (green/blue/outline/small/removable) |
| `client/src/pages/CareerAI/components/AiLoading.jsx` | CREATE | Spinning ✦ + Vietnamese loading text |
| `client/src/pages/CareerAI/components/InfoPill.jsx` | CREATE | Used in DetailPhase Tổng quan section |
| `client/src/pages/CareerAI/components/ProfileSection.jsx` | CREATE | Used in IdentityPhase left pane |
| `client/src/services/careerExplorerService.js` | CREATE | API layer for 5 endpoints |
| `client/src/App.jsx` | UPDATE | Change import: `CareerAI` → `CareerExplorer`, route `/career-ai` keep path but render new component |
| `client/src/components/AppHeader/AppHeader.jsx` | UPDATE | Line 73 — đổi label `'✦ Career AI'` → `'✦ Career Explorer'` (path giữ nguyên `/career-ai`) |

## NOT Building
- **Lưu lịch sử khám phá vào Neo4j** — V2 vẫn stateless như V1; reload sẽ reset wizard.
- **Ollama fallback hoạt động thực sự** — vẫn giữ mock fallback giống V1 (PRD nhắc tới Ollama nhưng code thật không kết nối). Nếu Gemini fail, mỗi endpoint trả mock data đúng schema.
- **D3.js** — reference dùng "D3 (constellation map)" trong comment, nhưng implementation thực tế là `<svg>` tĩnh + absolute-positioned `<div>`. Plan giữ approach này, KHÔNG thêm dependency D3.
- **Edit Career Identity Statement** — chỉ button "Tạo lại" gọi lại endpoint identity, không có inline edit.
- **Hover tooltip preview trên galaxy** giống V1's "CareerTooltip" — V2 dùng side panel cố định bên phải khi hover (đã có trong reference) nên không cần tooltip.
- **Tích hợp khoá học có affiliate link** — `courses` chỉ là text + platform name + emoji icon; nút "Xem →" tạm thời không link đi đâu (placeholder `#`).
- **Animation D3 force-layout** cho galaxy — dùng toạ độ x/y AI sinh trực tiếp (0.0–1.0), không animate.
- **Multilingual** — tiếng Việt only như V1.
- **Responsive < 640px polished** — V1 cũng chưa xử lý tốt mobile, V2 ưu tiên desktop tablet trước; chỉ đảm bảo không vỡ layout trên mobile.

---

## Step-by-Step Tasks

### TASK 1: Tách prompt và thêm 5 hàm AI service
- **ACTION**: Update `backend/src/services/aiService.js`. Xoá `chat`, `buildExportContext`, `CAREER_COUNSELOR_SYSTEM_PROMPT`, `buildMessages`. Giữ import `geminiProvider`.
- **IMPLEMENT**:
  - Helper chung `callGeminiJson(promptText, mockFallback)`:
    1. Gửi `[{ role: 'user', text: promptText }]` qua `geminiProvider.chat(messages)`.
    2. Strip ```json fences, `JSON.parse`, return parsed object.
    3. Nếu Gemini fail hoặc parse fail → return `mockFallback` và `console.warn`.
  - 5 export functions, mỗi function có prompt riêng + mock fallback theo schema:
    - `generateTasks({ role, organization })` → `{ tasks: string[6] }`
    - `generateSkills({ role, tasks })` → `{ skills: string[8] }`
    - `generateIdentityStatement({ role, organization, tasks, skills })` → `{ statement: string }`
    - `generateCareerPaths({ identityStatement, skills })` → `{ paths: [{id, title, type:'db'|'ai', salary, degree, x, y}] }` (8-10 items, x∈[0.05,0.95], y∈[0.05,0.95])
    - `generateCareerDetail({ careerId, careerTitle, userProfile })` → `{ description, sweetSpots, dayInLife: string[4-6], courses: [{title, platform, icon}] }`
- **MIRROR**: `LLM_PROVIDER_PATTERN`, `LLM_SERVICE_FALLBACK_PATTERN`
- **IMPORTS**: `const geminiProvider = require('./providers/geminiProvider');`
- **GOTCHA**:
  - Gemini với `responseMimeType: 'application/json'` đôi khi vẫn wrap trong code fence — phải strip.
  - Mock fallback phải đúng schema từng endpoint, không tái sử dụng mock của V1.
  - Prompt phải yêu cầu tiếng Việt rõ ràng (Gemini có thể trả tiếng Anh nếu prompt Anh).
  - Toạ độ `x, y` cho galaxy: prompt phải yêu cầu "evenly distributed, avoid center 0.4-0.6" để không đè lên center orb.
- **VALIDATE**:
  - Chạy `node -e "require('./backend/src/services/aiService').generateTasks({role:'Lập trình viên', organization:''}).then(console.log)"` (cần `cd backend` và có `.env` với `GEMINI_API_KEY`).
  - Output JSON đúng schema.

### TASK 2: Update aiController với 5 handler mới
- **ACTION**: Update `backend/src/controllers/aiController.js`. Xoá `careerPredict`, `exportContext`. Giữ `buildProfileContext` (vẫn cần cho identity và detail). Thêm 5 handler.
- **IMPLEMENT**: Cho mỗi endpoint:
  ```js
  const generateTasks = async (req, res, next) => {
    try {
      const { role, organization = '' } = req.body;
      if (!role || role.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Vai trò không được để trống.' });
      }
      if (role.length > 100) {
        return res.status(400).json({ success: false, error: 'Vai trò không quá 100 ký tự.' });
      }
      const result = await aiService.generateTasks({ role: role.trim(), organization: organization.trim() });
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      if (err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('quota')) {
        return res.status(503).json({ success: false, error: 'Hệ thống AI đang quá tải. Vui lòng thử lại sau.' });
      }
      next(err);
    }
  };
  ```
  - `generateSkills`: validate `role` + `tasks` (array, ≤ 20 items, mỗi item ≤ 200 ký tự).
  - `generateIdentity`: validate `role`, `skills` (≥ 3 items). Load profile bằng `userRepository.getUserProfile(req.user.userId)`, append `profileContext` vào input cho service.
  - `generateCareerPaths`: validate `identityStatement` (≥ 50 ký tự), `skills` (≥ 3 items).
  - `generateCareerDetail`: validate `careerId`, `careerTitle`. Load profile.
- **MIRROR**: `CONTROLLER_PATTERN`
- **IMPORTS**:
  ```js
  const aiService = require('../services/aiService');
  const userRepository = require('../repositories/userRepository');
  ```
- **GOTCHA**:
  - Không quên `module.exports = { generateTasks, generateSkills, generateIdentity, generateCareerPaths, generateCareerDetail }` đầy đủ.
  - Length limits: role ≤ 100, organization ≤ 100, mỗi task/skill ≤ 200, statement ≥ 50 / ≤ 2000 — match với UX để frontend không submit invalid.
- **VALIDATE**: Sau Task 3, gọi `curl -X POST http://localhost:3000/v1/ai/career-tasks -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"role":"Lập trình viên","organization":"VNG"}'` → trả `{ success: true, data: { tasks: [...] } }`.

### TASK 3: Update aiRoutes với 5 route mới
- **ACTION**: Update `backend/src/routes/aiRoutes.js`.
- **IMPLEMENT**:
  ```js
  const express = require('express');
  const router = express.Router();
  const aiController = require('../controllers/aiController');
  const authMiddleware = require('../middlewares/authMiddleware');

  router.use(authMiddleware.verifyToken);

  router.post('/career-tasks', aiController.generateTasks);
  router.post('/career-skills', aiController.generateSkills);
  router.post('/career-identity', aiController.generateIdentity);
  router.post('/career-paths', aiController.generateCareerPaths);
  router.post('/career-detail', aiController.generateCareerDetail);

  module.exports = router;
  ```
- **MIRROR**: `ROUTE_PATTERN`
- **GOTCHA**: `aiRoutes` đã được mount trong `server.js:85` (`app.use('/v1/ai', require('./routes/aiRoutes'));`) nên KHÔNG cần đụng `server.js`.
- **VALIDATE**: `cd backend && npm run dev` → server start không lỗi → 5 route trả 401 khi chưa có token, 200 khi có token + body hợp lệ.

### TASK 4: Tạo frontend API service
- **ACTION**: Create `client/src/services/careerExplorerService.js`.
- **IMPLEMENT**:
  ```js
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const API_URL = `${BASE_URL}/v1/ai`;

  const authHeaders = (token) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const post = async (path, body, token) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'AI service error');
    }
    return json.data;
  };

  export const fetchTasks = (token, payload) => post('/career-tasks', payload, token);
  export const fetchSkills = (token, payload) => post('/career-skills', payload, token);
  export const fetchIdentity = (token, payload) => post('/career-identity', payload, token);
  export const fetchCareerPaths = (token, payload) => post('/career-paths', payload, token);
  export const fetchCareerDetail = (token, payload) => post('/career-detail', payload, token);
  ```
- **MIRROR**: `FRONTEND_SERVICE_PATTERN` (notificationService.js)
- **IMPORTS**: none (vanilla fetch).
- **GOTCHA**: 401/403 — frontend chính (CareerExplorer) sẽ catch và redirect login giống V1.
- **VALIDATE**: Static — `npm run lint` không phàn nàn về unused imports.

### TASK 5: Tạo shared UI primitives (4 component nhỏ)
- **ACTION**: Create folder `client/src/pages/CareerAI/components/` với 5 file.
- **IMPLEMENT**: Port từ reference `docs/CareerExplorer.jsx:625-678` nhưng:
  - Đổi inline `style={{}}` sang Tailwind classes dùng project tokens.
  - `Btn.jsx`: `bg-primary` thay vì `#1a73e8`, sử dụng `text-primary-dark` cho hover.
  - `Chip.jsx`: variants `green | blue | outline | small | removable`. `green` → `bg-green-500 text-white`, `blue` → `bg-primary/10 text-primary`, `outline` → `border-2 border-dashed border-gray-300`.
  - `AiLoading.jsx`: spinning ✦ với `animate-spin` Tailwind.
  - `InfoPill.jsx`, `ProfileSection.jsx`: layout đơn giản như reference.
- **MIRROR**: `NAMING_CONVENTION_FRONTEND`, `TAILWIND_COLOR_TOKENS`
- **IMPORTS**: `import React from 'react';`
- **GOTCHA**:
  - Reference dùng emoji icons (🌱 🎓 💪 ✦ 💰); giữ nguyên hoặc thay bằng Material Symbols (`material-symbols-outlined` đã được nạp trong project — xem `AppHeader.jsx:90`).
  - Tránh dùng inline `style={{ fontFamily: "'Google Sans'..." }}` — project dùng Be Vietnam Pro qua `index.css`.
- **VALIDATE**: `npm run lint && npm run build` không error.

### TASK 6: Tạo WizardPhase
- **ACTION**: Create `client/src/pages/CareerAI/phases/WizardPhase.jsx`.
- **IMPLEMENT**: Port từ reference `docs/CareerExplorer.jsx:258-380`:
  - Props: `step, role, setRole, organization, setOrganization, tasks, selectedTasks, setSelectedTasks, skills, selectedSkills, setSelectedSkills, loading, onRoleNext, onOrgNext, onTasksNext, onSkillsNext, onBack`.
  - 4 step render conditional. Step 0: input role. Step 1: input organization. Step 2: AiLoading hoặc danh sách tasks (checkbox). Step 3: AiLoading hoặc danh sách skill chips (multi-select).
  - Sử dụng Tailwind: `min-h-[calc(100vh-60px)]`, `max-w-3xl mx-auto`, `flex flex-col`.
  - Validate enable button: step 0 cần `role.trim()`, step 3 cần `selectedSkills.length >= 3`.
- **MIRROR**: Reference + `TAILWIND_COLOR_TOKENS`
- **IMPORTS**:
  ```jsx
  import React from 'react';
  import Btn from '../components/Btn';
  import Chip from '../components/Chip';
  import AiLoading from '../components/AiLoading';
  ```
- **GOTCHA**:
  - Input step 0: `maxLength={50}` để khớp với hiển thị `role.length/50 ký tự`.
  - Step 2 default-checked all tasks (giống reference): `setSelectedTasks(tasks)` ngay khi tasks load xong (logic này nằm ở orchestrator, KHÔNG ở Wizard).
- **VALIDATE**: Manual flow trong browser sau khi orchestrator nối xong.

### TASK 7: Tạo IdentityPhase
- **ACTION**: Create `client/src/pages/CareerAI/phases/IdentityPhase.jsx`.
- **IMPLEMENT**: Port từ reference `docs/CareerExplorer.jsx:382-425`:
  - Props: `role, organization, selectedSkills, identityStatement, loading, onExplorePaths, onEditProfile, onRegenerate`.
  - Layout 2 cột: trái `ProfileSection` × 3 (Kinh nghiệm / Học vấn / Kỹ năng), phải card lớn với statement.
  - Button "Tạo lại" gọi `onRegenerate`. Button "Khám phá nghề nghiệp" gọi `onExplorePaths`.
- **MIRROR**: `TAILWIND_COLOR_TOKENS`
- **IMPORTS**: `Chip`, `ProfileSection`, `AiLoading`
- **GOTCHA**: `onEditProfile` quay về wizard step 0 — cần reset state ở orchestrator.
- **VALIDATE**: Manual.

### TASK 8: Tạo GalaxyPhase
- **ACTION**: Create `client/src/pages/CareerAI/phases/GalaxyPhase.jsx`.
- **IMPLEMENT**: Port từ reference `docs/CareerExplorer.jsx:427-512`:
  - Props: `careerPaths, loading, onCareerClick, onBack`.
  - SVG glow circles + center orb (absolute positioned).
  - Map `careerPaths` thành nodes ở `left: ${x*100}%; top: ${y*100}%`.
  - Hover → set `previewCareer` → show right panel (300px width, fixed top-right).
  - Legend bottom-left.
  - `useState` cho `hoveredId`, `previewCareer`.
- **MIRROR**: Reference
- **IMPORTS**:
  ```jsx
  import React, { useState } from 'react';
  import AiLoading from '../components/AiLoading';
  ```
- **GOTCHA**:
  - Reference dùng `window.innerWidth` ở module scope — gây hydration issues (tuy CSR-only của Vite không bị, vẫn nên chuyển vào `useEffect` + state để tránh static value).
  - Color theo `type`: `'db'` → `bg-primary` (màu xanh project), `'ai'` → `bg-green-500`.
  - Mobile: nodes có thể overlap — chấp nhận trong V2 (xem NOT Building).
- **VALIDATE**: Manual test resize window.

### TASK 9: Tạo DetailPhase
- **ACTION**: Create `client/src/pages/CareerAI/phases/DetailPhase.jsx`.
- **IMPLEMENT**: Port từ reference `docs/CareerExplorer.jsx:514-622`:
  - Props: `career, detail, loading, section, setSection, onBack`.
  - Header: "Hãy tưởng tượng bạn là:" + tên nghề (gradient text).
  - Fixed back button top-left, "Tìm việc phù hợp" top-right (link `/jobs?keyword=${career.searchKeyword || career.title}`).
  - Section dots (4 chấm) fixed left-center, click để chuyển section.
  - 4 section cards conditional render dựa trên `section` index.
  - Prev/Next buttons ở dưới.
- **MIRROR**: Reference
- **IMPORTS**:
  ```jsx
  import React from 'react';
  import { useNavigate } from 'react-router-dom';
  import AiLoading from '../components/AiLoading';
  import InfoPill from '../components/InfoPill';
  ```
- **GOTCHA**:
  - "Tìm việc phù hợp" phải dùng `useNavigate` thay vì `<a href>` để không reload (giống `ResultCard.jsx:89`).
  - Detail object có thể missing fields → guard `detail?.dayInLife?.map` etc.
- **VALIDATE**: Manual click section dots, click "Tìm việc phù hợp" → đến `/jobs?keyword=...`.

### TASK 10: Tạo CareerExplorer orchestrator
- **ACTION**: Create `client/src/pages/CareerAI/CareerExplorer.jsx`.
- **IMPLEMENT**: Port từ reference `docs/CareerExplorer.jsx:117-255` nhưng:
  - State machine giống reference (`phase: 'wizard'|'identity'|'galaxy'|'detail'`, `wizardStep: 0..3`).
  - Auth guard giống `PAGE_AUTH_GUARD_PATTERN`.
  - Sử dụng `AppHeader` thay vì custom header trong reference.
  - Replace mock API với `careerExplorerService` calls.
  - Handler logic:
    ```js
    const handleOrgNext = async () => {
      setWizardStep(2);
      setLoading(true);
      try {
        const { tasks } = await fetchTasks(token, { role, organization });
        setTasks(tasks);
        setSelectedTasks(tasks); // default check-all
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    ```
  - 401/403 trong service throw → catch ở orchestrator → `localStorage.removeItem('token')` + `navigate('/login')`.
  - Handlers: `handleRoleNext`, `handleOrgNext`, `handleTasksNext`, `handleSkillsNext`, `handleExplorePaths`, `handleCareerClick`, `handleRegenerateIdentity`.
- **MIRROR**: `PAGE_AUTH_GUARD_PATTERN`, error pattern từ `CareerAI.jsx:118-127`.
- **IMPORTS**:
  ```jsx
  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import AppHeader from '../../components/AppHeader/AppHeader';
  import WizardPhase from './phases/WizardPhase';
  import IdentityPhase from './phases/IdentityPhase';
  import GalaxyPhase from './phases/GalaxyPhase';
  import DetailPhase from './phases/DetailPhase';
  import {
    fetchTasks, fetchSkills, fetchIdentity, fetchCareerPaths, fetchCareerDetail
  } from '../../services/careerExplorerService';
  ```
- **GOTCHA**:
  - `<AppHeader activeTab="career-ai" />` — key này đã tồn tại trong AppHeader nav, không cần đổi.
  - State reset khi user click "+ Thêm kinh nghiệm" trong IdentityPhase: phải clear `tasks`, `selectedTasks`, `skills`, `selectedSkills` rồi `setPhase('wizard'); setWizardStep(0);`.
  - Khi `phase === 'galaxy'` mà `careerPaths.length === 0`: gọi `fetchCareerPaths` 1 lần (cờ `pathsLoaded`).
- **VALIDATE**: Full E2E manual: nhập role → next → next → tick task → next → tick ≥3 skill → next → identity load → "Khám phá" → galaxy load → click career → detail load → click section dot.

### TASK 11: Update App.jsx và AppHeader
- **ACTION**:
  - `client/src/App.jsx`: thay `import CareerAI from './pages/CareerAI/CareerAI.jsx';` → `import CareerExplorer from './pages/CareerAI/CareerExplorer.jsx';`. Thay `<CareerAI />` → `<CareerExplorer />`. Path giữ nguyên `/career-ai`.
  - `client/src/components/AppHeader/AppHeader.jsx`: dòng 73 đổi `label: '✦ Career AI'` → `label: '✦ Career Explorer'`. Path giữ nguyên `/career-ai`. Mobile menu icon `auto_awesome` (line 239) giữ nguyên.
- **MIRROR**: existing routing pattern.
- **GOTCHA**: Giữ nguyên path `/career-ai` để backward-compat link cũ; chỉ đổi label hiển thị.
- **VALIDATE**: `npm run build` pass; navigate manual.

### TASK 12: Xoá file cũ
- **ACTION**: Delete:
  - `client/src/pages/CareerAI/CareerAI.jsx`
  - `client/src/components/CareerAI/ChatBubble.jsx`
  - `client/src/components/CareerAI/OptionChips.jsx`
  - `client/src/components/CareerAI/ResultCard.jsx`
  - `client/src/components/CareerAI/ContextExporter.jsx`
- **GOTCHA**:
  - Verify không còn import nào tham chiếu các file này: `grep -r "ChatBubble\|OptionChips\|ResultCard\|ContextExporter" client/src/`.
  - Folder `client/src/components/CareerAI/` có thể xoá luôn nếu rỗng.
- **VALIDATE**: `npm run build` không complain về missing import.

### TASK 13: Smoke test toàn bộ flow + lint + build
- **ACTION**:
  1. `cd backend && npm run dev` (terminal 1, port 3000).
  2. `cd client && npm run dev` (terminal 2, port 5173).
  3. Browse `http://localhost:5173/career-ai` (login trước).
  4. Run flow: role "Lập trình viên" → org "VNG" → tick all tasks → tick 3 skills → identity → galaxy → click 1 career → click "Tìm việc phù hợp" → đến `/jobs?keyword=...`.
  5. Test edge: refresh giữa flow → quay về wizard step 0 (acceptable).
  6. Test edge: tắt `GEMINI_API_KEY` → mock fallback hoạt động đúng schema cho từng phase.
  7. `cd client && npm run lint && npm run build` — pass.
- **VALIDATE**: Tất cả validation commands phía dưới pass.

---

## Testing Strategy

### No Existing Test Suite
Project hiện tại không có unit/integration test runtime hoạt động (xem KEY_INSIGHT trên). Validation dựa vào:
1. **Lint**: `npm run lint` (client) — phát hiện unused imports, hooks rules.
2. **Type check**: KHÔNG có (project là JS thuần, không TS).
3. **Build verification**: `npm run build` — bundler báo lỗi nếu import sai.
4. **Manual smoke test**: theo checklist Validation Commands.
5. **API contract test**: dùng `curl` hoặc Postman cho 5 endpoint AI.

### Schema Validation (Critical for AI endpoints)
| Endpoint | Input shape | Output shape |
|---|---|---|
| POST `/v1/ai/career-tasks` | `{ role: string≤100, organization?: string≤100 }` | `{ success: true, data: { tasks: string[6] } }` |
| POST `/v1/ai/career-skills` | `{ role, tasks: string[≤20] }` | `{ success: true, data: { skills: string[8] } }` |
| POST `/v1/ai/career-identity` | `{ role, organization, tasks, skills: string[≥3] }` | `{ success: true, data: { statement: string≥100 } }` |
| POST `/v1/ai/career-paths` | `{ identityStatement: string, skills: string[] }` | `{ success: true, data: { paths: [{id, title, type, salary, degree, x, y}] } }` |
| POST `/v1/ai/career-detail` | `{ careerId, careerTitle }` | `{ success: true, data: { description, sweetSpots, dayInLife: string[], courses: [{title, platform, icon}] } }` |

### Edge Cases Checklist
- [ ] Empty role → 400 "Vai trò không được để trống."
- [ ] Role > 100 ký tự → 400 truncate hoặc reject
- [ ] selectedSkills < 3 ở wizard step 3 → button "Tiếp theo" disabled (không gọi API)
- [ ] Gemini API down (xoá GEMINI_API_KEY) → mock fallback đúng schema từng phase
- [ ] Gemini trả non-JSON → mock fallback
- [ ] Token expired (401) → frontend redirect `/login`
- [ ] User refresh giữa flow → state reset về wizard step 0 (acceptable, NOT bug)
- [ ] User profile rỗng (chưa onboard) → identity statement vẫn generate được nhưng generic
- [ ] Galaxy có 2 nodes overlap (x,y gần nhau) → vẫn click được nhưng overlap visual; chấp nhận trong V2
- [ ] User vào trực tiếp `/career-ai` chưa login → redirect `/login` (giống V1)

---

## Validation Commands

### Static Analysis (Frontend)
```powershell
cd client
npm run lint
```
EXPECT: Zero errors (warnings về unused vars match pattern `^[A-Z_]` được tolerate).

### Build Verification (Frontend)
```powershell
cd client
npm run build
```
EXPECT: Build success, không lỗi import, bundle size không tăng đột biến (~baseline ±10%).

### Backend Server Start
```powershell
cd backend
npm run dev
```
EXPECT: Server boots on port 3000, log "Successfully connected to Neo4j", không lỗi require/syntax.

### API Contract Tests (sau khi server chạy)
```powershell
# Login để lấy token
$body = @{ email = "test@example.com"; password = "password123" } | ConvertTo-Json
$res = Invoke-RestMethod -Method POST -Uri http://localhost:3000/v1/auth/login -Body $body -ContentType "application/json"
$token = $res.data.token

# Test career-tasks
$body = @{ role = "Lập trình viên"; organization = "VNG" } | ConvertTo-Json -Compress
Invoke-RestMethod -Method POST -Uri http://localhost:3000/v1/ai/career-tasks `
  -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body $body
```
EXPECT: `{ success: $true, data: { tasks: [...6 strings] } }`. Lặp tương tự cho 4 endpoint còn lại.

### Manual Browser Validation
- [ ] Truy cập `http://localhost:5173/career-ai` khi chưa login → redirect `/login`.
- [ ] Sau login, truy cập lại → thấy WizardPhase step 0.
- [ ] Nhập role "Lập trình viên" → counter `12/50 ký tự` chính xác → "Tiếp theo" enabled.
- [ ] Step 1: nhập organization "VNG" → "Tiếp theo" → AI loading "Đang tạo danh sách nhiệm vụ..." trong ≤ 5s → 6 task hiện ra, all checked.
- [ ] Bỏ check 1 task → check lại — UX mượt.
- [ ] Step 3: tick chỉ 2 skill → "Tiếp theo" disabled. Tick skill thứ 3 → enabled.
- [ ] Identity statement load trong ≤ 5s, ≥ 100 ký tự, tiếng Việt.
- [ ] Click "Khám phá nghề nghiệp" → galaxy load 8-10 nodes phân bố không đè nhau.
- [ ] Hover node → preview panel hiện bên phải với salary + degree.
- [ ] Click node → DetailPhase load ≤ 5s, 4 section đầy đủ.
- [ ] Click 4 section dots — render đúng nội dung.
- [ ] Click "Tìm việc phù hợp" top-right → đến `/jobs?keyword=...`.
- [ ] Click "← Quay lại" trong DetailPhase → về Galaxy (giữ state).
- [ ] Click "← Quay lại" trong Galaxy → về Identity.

### Regression Check (existing features)
- [ ] `/jobs` vẫn hoạt động bình thường.
- [ ] `/profile` không vỡ.
- [ ] Header nav links đầy đủ; "✦ Career Explorer" hiển thị đúng vị trí.
- [ ] Mobile menu mở được, Career Explorer link hoạt động.

---

## Acceptance Criteria
- [ ] Tất cả 13 task hoàn tất.
- [ ] 5 endpoint AI mới hoạt động và trả đúng schema.
- [ ] Route `/career-ai` render `CareerExplorer.jsx` thay vì `CareerAI.jsx`.
- [ ] Wizard 4 step → Identity → Galaxy → Detail hoạt động end-to-end với Gemini API thật.
- [ ] Mock fallback hoạt động khi tắt `GEMINI_API_KEY`.
- [ ] Auth guard hoạt động (redirect login khi chưa có token).
- [ ] CTA "Tìm việc phù hợp" link đúng `/jobs?keyword=...`.
- [ ] Frontend lint + build pass.
- [ ] Backend server start không lỗi.
- [ ] Không còn reference đến file đã xoá (ChatBubble/OptionChips/ResultCard/ContextExporter/CareerAI).

## Completion Checklist
- [ ] Code follows discovered patterns (CONTROLLER_PATTERN, ROUTE_PATTERN, FRONTEND_SERVICE_PATTERN).
- [ ] Error handling matches `aiController.careerPredict` style (specific 503 cho RESOURCE_EXHAUSTED).
- [ ] Logging dùng `console.warn`/`console.error` với prefix `[aiService]` giống V1.
- [ ] Tailwind classes dùng project tokens (`text-primary`, `bg-primary/10`) thay vì hex inline.
- [ ] Không hardcode URL (dùng `import.meta.env.VITE_API_URL`).
- [ ] Vietnamese language consistent trong UI text.
- [ ] No `console.log` debug residuals.
- [ ] No `any` / `// @ts-ignore` (project là plain JS, nhưng ý là không stub bừa).
- [ ] Self-contained — không cần search codebase trong khi implement.
- [ ] Update memory: `c:\Users\nguye\.claude\projects\c--career-website\memory\project_career_explorer_replacement.md` đánh dấu shipped khi xong.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini trả JSON không đúng schema (đặc biệt với prompt tiếng Việt phức tạp) | Medium | High — UI vỡ | Strict mock fallback theo schema; log warning khi parse fail; có thể thêm `responseSchema` vào geminiProvider config sau |
| Gemini hết quota giữa flow user → mỗi phase fail khác nhau | Medium | Medium — UX không đồng nhất | Mỗi endpoint có mock riêng; show error toast tiếng Việt thân thiện |
| Galaxy nodes overlap khi LLM sinh x/y gần nhau | High | Low — visual lỗi nhỏ | Trong prompt yêu cầu phân tán; nếu quá nặng có thể thêm post-processing redistribute trong service |
| Mobile UX vỡ vì layout fixed-position | High | Medium — nhánh user mobile | Document trong NOT Building; ưu tiên desktop V2; mobile cải thiện ở V2.1 |
| Latency cao (>5s) cho Gemini call → user bỏ giữa chừng | Medium | Medium | Mỗi phase có loading state rõ ràng; có thể add abort controller khi user quay lại |
| Xoá ContextExporter làm mất tính năng "copy to ChatGPT" mà có user đang dùng | Low | Low — V1 mới ship, ít user lock-in | Chấp nhận; có thể restore ở DetailPhase nếu user phản hồi |
| Backend env `GEMINI_MODEL` mặc định khác giữa các provider | Low | Low | Code dùng `gemini-2.0-flash` mặc định, log model name khi gọi |

## Notes
- **Tại sao tách 5 endpoint thay vì 1 endpoint chung?** Mỗi phase có schema output rất khác nhau. Tách giúp:
  1. Dễ test schema riêng từng phase.
  2. Mock fallback chính xác hơn.
  3. Có thể optimize prompt độc lập (galaxy paths cần `temperature` cao hơn để diverse, identity statement cần thấp hơn để consistent).
- **Tại sao không dùng D3?** Reference chỉ comment "D3" nhưng code dùng `<svg>` static + `position: absolute`. Thêm D3 (~80kb gzipped) là over-engineering cho V2.
- **Identity Statement có nên save vào Neo4j?** Trong NOT Building V2. Có thể là V2.1 — thêm node `:CareerProfile` linked to `User` để show lại lần sau.
- **PRD `.agent/PRPs/prds/ai-career-prediction.prd.md` Phase 5 "KORRA Jobs Integration"** đã được ship trong V1 (link `/jobs?keyword=...` trong ResultCard). V2 giữ tính năng này tại DetailPhase header CTA.
- **Tại sao path vẫn là `/career-ai`?** Để không vỡ existing bookmarks/notification links. Label nav đổi thành "Career Explorer" để phản ánh trải nghiệm mới.
- **Reference file `docs/CareerExplorer.jsx`** là Google Sans + inline styles. Plan này đã re-skin sang Tailwind project tokens + Be Vietnam Pro để khớp với phần còn lại của KORRA. Đừng commit reference file vào src/.
- **Vần Vietnamese keyboard shortcut `Enter` trong input step 0/1** — port nguyên từ reference `onKeyDown={e => e.key === "Enter" && onRoleNext()}`.

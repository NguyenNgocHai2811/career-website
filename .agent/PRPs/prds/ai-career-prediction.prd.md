# AI Career Prediction — Career Discovery Engine

## Problem Statement

Học sinh, sinh viên mới ra trường và người muốn chuyển ngành đang hoang mang trước sự bùng nổ của thị trường lao động AI, nhưng không có công cụ nào giúp họ **khám phá bản thân một cách có hướng dẫn**. Họ thiếu kinh nghiệm để tự biết mình thích gì, các công cụ hiện tại (ChatGPT, Gemini) trả về quá nhiều thông tin không được cá nhân hóa và không có giao diện chuyên biệt giúp họ dần dần khám phá từng bước.

## Evidence

- Người dùng chưa có trải nghiệm thực tế → không biết "IT có gì trong đó", không thể tự điền vào chỗ trống về đam mê.
- ChatGPT/Gemini đang đưa ra thông tin quá nhiều và rườm rà, không có luồng gợi mở từng step.
- Thị trường nghề nghiệp đang biến động mạnh sau làn sóng AI thay thế công việc cũ (2024–2025) → nhu cầu định hướng nghề nghiệp tăng cao.
- KORRA đã có dữ liệu profile người dùng (skills, education, experience) — đây là lợi thế lớn để cá nhân hóa mà ChatGPT không có.

## Proposed Solution

Xây dựng module **Career Discovery Engine** — một tính năng hội thoại AI được nhúng vào KORRA, giúp người dùng **tự khám phá nghề nghiệp phù hợp** thông qua luồng chat có hướng dẫn:
1. Người dùng tự do mô tả bản thân (vai trò, điểm mạnh, sở thích ngắn gọn).
2. AI đọc profile có sẵn + câu trả lời → đưa ra các **option gợi mở** để người dùng đào sâu hơn.
3. Sau 2–3 vòng hội thoại, AI đưa ra **3 gợi ý nghề nghiệp**, mỗi gợi ý kèm theo **lý do giải thích tại sao phù hợp** (Explainable AI).

**LLM Strategy**: Google Gemini (primary) → Ollama local (fallback khi hết quota).

## Key Hypothesis

Chúng tôi tin rằng **tính năng AI gợi ý nghề nghiệp có hướng dẫn** sẽ giúp **học sinh và sinh viên chưa có định hướng** giải quyết được **sự hoang mang nghề nghiệp ban đầu**.
Chúng ta sẽ biết mình đúng khi **tỷ lệ người dùng hoàn thành luồng chat và nhấp vào ít nhất 1 công việc được gợi ý đạt trên 35%**.

## What We're NOT Building (V1)

- Lưu lịch sử hội thoại AI.
- Tích hợp gợi ý khóa học học tập (Coursera, Udemy...).
- Hỗ trợ voice/multimodal input.
- Tư vấn lương thưởng hay so sánh thị trường chi tiết.

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Tỷ lệ hoàn thành luồng chat (completion rate) | > 60% | Log số session bắt đầu vs hoàn tất |
| Tỷ lệ click vào job gợi ý sau khi nhận kết quả | > 35% | Track sự kiện click từ kết quả AI |
| Tỷ lệ người dùng quay lại trong 7 ngày (retention D7) | Tăng 15% vs nhóm không dùng | So sánh Analytics hai nhóm |

## Open Questions

- [ ] **LLM Budget:** Quota miễn phí của Gemini là bao nhiêu request/ngày? Khi nào thì trigger chuyển sang Ollama?
- [ ] **Thước đo thành công retention:** Cần định nghĩa "quay lại" là xem job hay nhắn tin với recruiter?

---

## Users & Context

**Primary User**
- **Ai**: (1) Học sinh lớp 12 chưa biết ngành nào, (2) Sinh viên năm 1-2 còn phân vân, (3) Người muốn chuyển ngành nhưng chưa biết đi đâu.
- **Hành vi hiện tại**: Tra Google, hỏi ChatGPT, làm trắc nghiệm MBTI — nhưng kết quả quá chung chung.
- **Kích hoạt (Trigger)**: Lạc lõng khi nghĩ đến tương lai, hoặc đang tìm việc trên KORRA không biết tìm từ khóa nào.
- **Trạng thái thành công**: Họ biết được 2-3 hướng nghề nghiệp cụ thể có giải thích rõ ràng và bắt đầu khám phá các công việc liên quan.

**Job to Be Done**
Khi tôi **chưa biết mình thích ngành gì và phù hợp gì**, tôi muốn **biết thêm thông tin để gợi mở cho tương lai nghề nghiệp**, để tôi có thể **ra quyết định tự tin hơn về hướng đi của mình**.

**Non-Users (V1)**
- Người đã có 10+ năm kinh nghiệm và biết rõ mình muốn gì.
- Người tìm kiếm tư vấn chuyên sâu về lương/thị trường.

---

## Solution Detail

### Core Capabilities (MoSCoW)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | Chat UI với giới hạn ký tự input | Entry point cho người dùng bắt đầu hội thoại |
| Must | AI đọc profile KORRA làm context | Cá nhân hóa kết quả — lợi thế so với ChatGPT thuần |
| Must | AI đưa ra option gợi mở sau mỗi lượt | Tránh người dùng bế tắc vì không biết điền gì |
| Must | 3 gợi ý nghề nghiệp + lý do (Explainable AI) | Kết quả cuối cùng có giá trị và dễ hiểu |
| Must | Fallback: Gemini → Ollama | Đảm bảo hệ thống hoạt động ổn định |
| Should | Hover tooltip tóm tắt ngành | Xem nhanh thông tin mà không mất flow |
| Should | Export context → Copy nhanh sang Gemini/ChatGPT | Không khóa người dùng trong app, tăng trust |
| Should | Liên kết kết quả gợi ý với các Jobs có trên KORRA | Chuyển đổi từ khám phá sang hành động |
| Could | Lưu kết quả gợi ý vào profile người dùng | Để tham khảo sau |
| Won't | Email kết quả | Ngoài phạm vi V1 |

### MVP Scope

- 1 trang chat đơn giản (không lưu session).
- AI đọc profile hiện tại của user + câu nhập → trả về tối đa 3 vòng gợi mở options → kết quả cuối 3 ngành nghề.
- Mỗi kết quả có: tên ngành, mô tả ngắn, **lý do tại sao phù hợp với user**, và link tìm kiếm jobs trên KORRA.

### User Flow

```
Người dùng vào trang /career-ai
  ↓
Hệ thống tự động tải profile (skills, education) làm context ẩn
  ↓
User gõ mô tả ngắn: "Tôi học giỏi toán, thích làm việc một mình"
  ↓
AI phân tích + đưa ra 3-4 option gợi mở (dạng chip/button):
  [Lập trình]  [Phân tích dữ liệu]  [Nghiên cứu]  [Kế toán tài chính]
  ↓
User chọn 1-2 option → AI hỏi tiếp để đào sâu
  ↓
(sau 2-3 vòng) AI xuất kết quả:
  📌 Gợi ý 1: Data Analyst
     "Vì bạn giỏi toán và thích làm việc độc lập, phân tích dữ liệu..."
  📌 Gợi ý 2: Backend Developer
     ...
  📌 Gợi ý 3: Nhà nghiên cứu học thuật
     ...
  ↓
  [Khi người dùng rê chuột (hover) vào một gợi ý]
    → Hiện tooltip tóm tắt nhanh:
       - Mô tả công việc trong 2-3 câu
       - Kỹ năng cần có
       - Mức lương trung bình (nếu có)
  ↓
  [Nếu muốn tìm hiểu sâu hơn]
    → Nút [📋 Sao chép ngữ cảnh & Hỏi AI khác]
      → Copy vào clipboard một đoạn text có cấu trúc:
         "Tôi vừa hoàn thành khám phá nghề nghiệp trên KORRA.
          Các lựa chọn tôi đã chọn: [Lập trình] → [Backend]
          Gợi ý nhận được: Data Analyst, Backend Developer, Nhà nghiên cứu
          Tôi muốn tìm hiểu sâu hơn về [tên ngành]..."
      → Kèm theo các nút shortcut: [Mở Gemini] [Mở ChatGPT]
  ↓
Mỗi gợi ý có nút [Tìm việc liên quan trên KORRA →]
```

---

## Technical Approach

**Feasibility**: HIGH

**Architecture Notes**

- **LLM Integration Layer (abstraction):**
  ```
  aiService.js
    ├── providers/geminiProvider.js   (Google Gemini API)
    └── providers/ollamaProvider.js   (Local Ollama fallback)
  ```
  Nếu Gemini trả về lỗi quota, `aiService` tự động switch sang Ollama.

- **Profile Context Injection:** Gọi `userRepository.getUserProfile(userId)` để lấy skills/education/experience rồi nhúng vào system prompt của LLM. Không cần repository mới.

- **Prompt Engineering Strategy:**
  - **System Prompt:** Định nghĩa vai trò AI là "career counselor" chuyên về Việt Nam, trả lời bằng tiếng Việt, luôn giải thích lý do.
  - **Structured Output:** Yêu cầu LLM trả về JSON có cấu trúc để Frontend dễ render (tên ngành, mô tả, lý do, từ khóa tìm job).

- **API Pattern:** Thêm route mới `/v1/ai/career-predict` theo đúng pattern hiện có của KORRA.

**Technical Risks**

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Gemini API bị rate limit | Medium | Implement fallback sang Ollama |
| LLM trả về JSON không đúng cấu trúc | Medium | Validate & retry với prompt cụ thể hơn |
| Prompt injection từ user input độc hại | Low | Sanitize input, giới hạn ký tự, system prompt cứng |
| Latency cao khi gọi LLM (>3s) | Medium | Hiển thị typing indicator, streaming response nếu có thể |

---

## Implementation Phases

<!--
  STATUS: pending | in-progress | complete
  PARALLEL: phases that can run concurrently
  DEPENDS: phases that must complete first
-->

| # | Phase | Description | Status | Parallel | Depends | PRP Plan |
|---|-------|-------------|--------|----------|---------|----------|
| 1 | LLM Service Layer | Tạo `aiService.js` với Gemini + Ollama provider, abstraction layer | complete | - | - | - |
| 2 | Backend API | Route `/v1/ai/career-predict`, Controller, xử lý profile context | complete | - | 1 | - |
| 3 | Prompt Engineering | Thiết kế system prompt, structured JSON output, guided options logic | complete | with 2 | 1 | - |
| 4 | Frontend Chat UI | Trang `/career-ai`, Chat component, Option chips, Result cards | complete | - | 2,3 | - |
| 5 | KORRA Jobs Integration | Link kết quả AI → Job search với từ khóa tương ứng | pending | - | 4 | - |

### Phase Details

**Phase 1: LLM Service Layer**
- **Goal**: Abstraction layer linh hoạt, dễ đổi provider.
- **Scope**: `backend/src/services/aiService.js`, `backend/src/services/providers/geminiProvider.js`, `backend/src/services/providers/ollamaProvider.js`.
- **Success signal**: Có thể gọi `aiService.chat(messages)` và nhận response từ Gemini.

**Phase 2: Backend API**
- **Goal**: Expose endpoint để Frontend gọi.
- **Scope**: `aiController.js`, `aiRoutes.js`, mount `/v1/ai`.
- **Success signal**: POST `/v1/ai/career-predict` với `{message, conversationHistory}` → trả về JSON gợi ý.

**Phase 3: Prompt Engineering**
- **Goal**: LLM trả về đúng chuẩn JSON có thể render được.
- **Scope**: Nằm trong `aiService.js` — system prompt, response schema, retry logic.
- **Success signal**: Response luôn có dạng `{options: [...], suggestions: [...] | null, reasoning: "..."}`.

**Phase 4: Frontend Chat UI**
- **Goal**: Giao diện chat đẹp, trực quan, dễ dùng.
- **Scope**: `client/src/pages/CareerAI/CareerAI.jsx`, các sub-components:
  - `ChatBubble.jsx` — hiển thị tin nhắn
  - `OptionChips.jsx` — các lựa chọn gợi mở từ AI
  - `ResultCard.jsx` — kết quả gợi ý cuối cùng
  - `CareerTooltip.jsx` — hover tooltip tóm tắt ngành (2-3 câu, kỹ năng, mức lương)
  - `ContextExporter.jsx` — nút copy context + shortcut [Mở Gemini] / [Mở ChatGPT]
- **Success signal**: User có thể chat, nhận kết quả, hover để xem tóm tắt, và copy context để tiếp tục trên AI khác.

**Phase 5: KORRA Jobs Integration**
- **Goal**: Tạo cầu nối từ khám phá nghề sang tìm việc thực tế.
- **Scope**: Nút "Tìm việc" trong ResultCard → điều hướng đến `/jobs?keyword={suggestedCareer}`.
- **Success signal**: Click vào nút → trang Jobs hiển thị đúng kết quả tìm kiếm.

---

## Decisions Log

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| LLM Provider | Gemini → Ollama fallback | OpenAI only | Gemini miễn phí, Ollama đảm bảo uptime khi hết quota |
| Output Format | Structured JSON | Free text | Dễ render UI, dễ validate |
| Profile Context | Tự động inject từ DB | User tự nhập lại | Cá nhân hóa tốt hơn, UX mượt mà hơn |
| Conversation History | Client-side only (không lưu DB) | Lưu vào Neo4j | Đơn giản cho V1, tránh chi phí storage |

---

## Research Summary

**Market Context**
Top sản phẩm 2025 dùng Multi-Agent + Progressive Disclosure UX. Explainable AI là xu hướng bắt buộc để tạo niềm tin. KORRA đang xây đúng hướng với luồng hybrid (free text + guided options).

**Technical Context**
Codebase hiện tại cực kỳ thuận lợi:
- `getUserProfile()` (userRepository) trả về đủ skills/education/experience để làm context.
- Pattern Route → Controller → Service đã chuẩn hóa, AI service cắm vào tự nhiên.
- Không cần thêm bất kỳ infrastructure mới nào (không cần vector DB, không cần embedding).

---

*Generated: 2026-04-09*
*Status: DRAFT — cần chốt LLM budget và định nghĩa retention metric*

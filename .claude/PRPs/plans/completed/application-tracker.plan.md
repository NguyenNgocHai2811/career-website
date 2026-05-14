# Plan: Application Tracker

## Summary
Add a candidate-facing application tracker so users can manage every place they have applied, including internal Korra jobs and manually tracked external applications. The feature builds on the existing `APPLIED_TO` relationship, preserves recruiter-owned application status, and adds candidate-owned tracking metadata such as notes, follow-up dates, interview dates, contacts, and archive state.

## User Story
As a candidate, I want a single place to track jobs and companies I applied to, so that I can follow up, prepare interviews, and manage outcomes without losing context.

## Problem -> Solution
Current state: Candidates can apply to an internal job and later only see `hasApplied` on the job detail; recruiters can manage applicants, but candidates do not have a management surface for their own pipeline.
Desired state: Candidates have an `/applications` workspace showing internal and external applications, filters, quick stats, notes, follow-up reminders, contact fields, and links back to job details.

## Metadata
- **Complexity**: Large
- **Source PRD**: N/A
- **PRD Phase**: standalone
- **Estimated Files**: 8

---

## UX Design

### Before
```text
Candidate flow:
Jobs page -> Apply modal -> success toast/state
Profile -> Saved jobs only
No candidate-facing list of submitted applications
```

### After
```text
Candidate flow:
Jobs page -> Apply modal -> success -> Applications page

Applications page:
Header stats: total, interviewing, offers, follow-up due
Filters: status, source, search, archived
Main list: company, role, official recruiter status, candidate status, dates
Side/detail panel: notes, contact, follow-up date, interview date, links/actions
Manual add: track an external application outside Korra
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Apply success | Marks selected job as `hasApplied` | Also links users to `/applications` | Do not interrupt current modal success flow |
| Header nav | Jobs, Network, Messages, Career Explorer | Candidate users also see `Applications` | Only show for logged-in candidates |
| Profile saved jobs | Saved jobs only | Optional cross-link to applications tracker | Saved jobs remain separate |
| Candidate tracker | None | Filterable workspace with edit drawer/modal | Use existing card/list visual language |
| Recruiter status | Recruiter-only applicant pipeline | Candidate can view official status but not overwrite it | Keep `r.status` recruiter-owned |

---

## Mandatory Reading

Files that MUST be read before implementing:

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `backend/src/repositories/jobRepository.js` | 295-347 | Existing `APPLIED_TO` relationship creation and fields |
| P0 (critical) | `backend/src/repositories/jobRepository.js` | 396-414 | Existing candidate-owned saved-job list query pattern |
| P0 (critical) | `backend/src/controllers/jobController.js` | 53-116 | Current apply endpoint validation, notification, response shape |
| P0 (critical) | `backend/src/routes/jobRoutes.js` | 10-20 | Route order; candidate application routes must be declared before `/:id` |
| P1 (important) | `backend/src/repositories/recruiterRepository.js` | 186-226 | Recruiter applicant list fields returned from `APPLIED_TO` |
| P1 (important) | `backend/src/repositories/recruiterRepository.js` | 276-291 | Recruiter-owned status update pattern; do not reuse for candidate edits |
| P1 (important) | `client/src/services/jobService.js` | 78-112 | Existing authenticated candidate job service functions |
| P1 (important) | `client/src/pages/Profile/ProfileSavedJobs.jsx` | 1-135 | Similar candidate-owned list UI and loading/empty states |
| P1 (important) | `client/src/pages/JobSearch/JobSearch.jsx` | 9-50 | Existing apply modal submit flow |
| P1 (important) | `client/src/pages/JobSearch/JobSearch.jsx` | 622-661 | Applied and saved action button states |
| P1 (important) | `client/src/App.jsx` | 25-52 | Frontend route registration |
| P1 (important) | `client/src/components/AppHeader/AppHeader.jsx` | 83-96 | Header nav link construction and role-aware dashboard link |
| P2 (reference) | `client/src/pages/Recruiter/RecruiterDashboard.jsx` | 577-618 | Existing status config/dropdown visual pattern |
| P2 (reference) | `client/src/pages/Recruiter/RecruiterDashboard.jsx` | 621-672 | Filterable application list state pattern |
| P2 (reference) | `backend/src/middlewares/authMiddleware.js` | 5-20 | Required token middleware behavior |
| P2 (reference) | `backend/src/server.js` | 74-81 | Mounted route prefixes |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| N/A | N/A | No external research needed; feature uses established React, Express, Neo4j, and Tailwind patterns already in the repo. |

---

## Patterns to Mirror

Code patterns discovered in the codebase. Follow these exactly.

### NAMING_CONVENTION
// SOURCE: `client/src/services/jobService.js:78-87`
```javascript
export const getSavedJobs = async (token) => {
  const response = await fetch(`${API_URL}/saved`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch saved jobs');
  const result = await response.json();
  return result.data;
};
```

### ERROR_HANDLING
// SOURCE: `backend/src/controllers/jobController.js:60-116`
```javascript
const applyToJob = async (req, res, next) => {
  try {
    // validate input, call repository, return JSON
  } catch (error) {
    next(error);
  }
};
```

### ROUTE_ORDERING
// SOURCE: `backend/src/routes/jobRoutes.js:10-20`
```javascript
router.get('/saved', authMiddleware.verifyToken, jobController.getSavedJobs);
router.get('/recommended', authMiddleware.verifyToken, jobController.getRecommendedJobs);
router.get('/:id', authMiddleware.verifyTokenOptional, jobController.getJobById);
router.post('/:id/apply', authMiddleware.verifyToken, uploadCV.single('cv'), jobController.applyToJob);
```
Add `/applications` routes before `/:id`, otherwise Express will treat `applications` as a job id.

### REPOSITORY_PATTERN
// SOURCE: `backend/src/repositories/jobRepository.js:396-414`
```javascript
const getSavedJobs = async (userId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[r:SAVED_JOB]->(j:Job)-[:BELONGS_TO]->(c:Company)
       RETURN j, c, r.savedAt AS savedAt
       ORDER BY r.savedAt DESC`,
      { userId }
    );
    return result.records.map(record => ({
      ...record.get('j').properties,
      company: record.get('c').properties,
      savedAt: record.get('savedAt'),
      isSaved: true,
    }));
  } finally {
    await session.close();
  }
};
```

### APPLICATION_RELATIONSHIP
// SOURCE: `backend/src/repositories/jobRepository.js:315-327`
```cypher
MATCH (u:User {userId: $userId})
MATCH (j:Job {jobId: $jobId, status: 'ACTIVE'})
WHERE NOT (u)-[:POSTED]->(j)
OPTIONAL MATCH (recruiter:User)-[:POSTED]->(j)
CREATE (u)-[r:APPLIED_TO {
  cvType: $cvType,
  cvUrl: $cvUrl,
  coverLetter: $coverLetter,
  status: 'PENDING',
  appliedAt: datetime()
}]->(j)
RETURN r, j.title AS jobTitle, recruiter.userId AS recruiterId
```

### RECRUITER_STATUS_OWNERSHIP
// SOURCE: `backend/src/repositories/recruiterRepository.js:276-287`
```javascript
const updateApplicationStatus = async (recruiterId, applicantId, jobId, newStatus) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (recruiter:User {userId: $recruiterId})-[:POSTED]->(j:Job {jobId: $jobId})<-[r:APPLIED_TO]-(applicant:User {userId: $applicantId})
       SET r.status = $newStatus, r.updatedAt = datetime()
       RETURN r`,
      { recruiterId, applicantId, jobId, newStatus }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('r').properties;
  } finally {
    await session.close();
  }
};
```

### FRONTEND_LIST_STATE
// SOURCE: `client/src/pages/Profile/ProfileSavedJobs.jsx:5-34`
```javascript
const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(true);

const fetchSavedJobs = useCallback(async () => {
  setLoading(true);
  try {
    const data = await getSavedJobs(token);
    setJobs(data || []);
  } catch (err) {
    console.error('Failed to fetch saved jobs:', err);
  } finally {
    setLoading(false);
  }
}, [token]);
```

### STATUS_UI_PATTERN
// SOURCE: `client/src/pages/Recruiter/RecruiterDashboard.jsx:577-583`
```javascript
const STATUS_CONFIG = {
  PENDING: { icon: 'schedule', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  SHORTLISTED: { icon: 'star', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  INTERVIEWED: { icon: 'forum', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  HIRED: { icon: 'verified', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  REJECTED: { icon: 'block', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
};
```

### TEST_STRUCTURE
// SOURCE: `backend/test_apply_cv.js:36-52`
```javascript
const applyResult = await applyToJob(candidateId, jobId, applyData);
const hasAppliedResult = await hasApplied(candidateId, jobId);
const applicants = await recruiterRepo.getApplicants(recruiterId, jobId);
```
There is no formal automated test suite yet. Use focused Node smoke scripts or repository-level checks if adding tests.

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `backend/src/repositories/jobRepository.js` | UPDATE | Add candidate application list, update, archive, and external tracking methods |
| `backend/src/controllers/jobController.js` | UPDATE | Add candidate controller endpoints and input validation |
| `backend/src/routes/jobRoutes.js` | UPDATE | Add `/applications` routes before `/:id` |
| `client/src/services/applicationService.js` | CREATE | Keep tracker API calls separate from job browsing service |
| `client/src/pages/Applications/ApplicationTracker.jsx` | CREATE | New candidate-facing tracker page |
| `client/src/App.jsx` | UPDATE | Register `/applications` route |
| `client/src/components/AppHeader/AppHeader.jsx` | UPDATE | Add candidate nav link to tracker |
| `client/src/pages/JobSearch/JobSearch.jsx` | UPDATE | Add post-apply link/callout to tracker without changing apply semantics |
| `client/src/pages/Profile/ProfileSavedJobs.jsx` | UPDATE | Add small cross-link to tracker empty/action area |

## NOT Building

- No calendar integration or email sending.
- No AI-generated follow-up emails in V1.
- No recruiter-facing changes beyond preserving current status updates.
- No public exposure of candidate notes or contact fields.
- No deletion that removes historical application data; use archive/restore instead.
- No database migration framework; Neo4j property additions are additive and lazy.

---

## Step-by-Step Tasks

### Task 1: Define Candidate Application Data Contract
- **ACTION**: Decide and document the returned object shape in code comments near repository/controller.
- **IMPLEMENT**: Return applications with:
  - `jobId`, `title`, `company`, `location`, `employmentType`, `salaryMin`, `salaryMax`
  - `source`: `internal` or `external`
  - `officialStatus`: existing `r.status` from recruiter workflow, default `PENDING`
  - `candidateStatus`: candidate-owned status, default `APPLIED`
  - `appliedAt`, `updatedAt`, `followUpAt`, `interviewAt`, `archived`
  - `notes`, `contactName`, `contactEmail`, `contactPhone`, `externalUrl`
  - `cvType`, `cvUrl`, `coverLetter`
- **MIRROR**: `getSavedJobs` response composition in `jobRepository.js`.
- **IMPORTS**: none.
- **GOTCHA**: Do not call candidate status simply `status`; `r.status` already means recruiter official status.
- **VALIDATE**: Compare with recruiter application response from `getApplicants`.

### Task 2: Add Candidate Repository Methods
- **ACTION**: Update `backend/src/repositories/jobRepository.js`.
- **IMPLEMENT**:
  - `getMyApplications(userId, filters = {})`
  - `updateMyApplication(userId, jobId, data)`
  - `archiveMyApplication(userId, jobId, archived = true)`
  - `createExternalApplication(userId, data)`
- **MIRROR**: Session lifecycle and record mapping from `getSavedJobs`.
- **IMPORTS**: Reuse existing `driver`; add `uuidv4` only if external applications need generated job/company ids.
- **GOTCHA**: `getAllJobs` only returns `j.status = 'ACTIVE'`, so external tracked jobs must not be `ACTIVE`. Use `status: 'TRACKED'` and `source: 'external'`.
- **VALIDATE**: Run a local Node smoke query after creating sample internal/external records.

### Task 3: Implement Candidate List Query
- **ACTION**: Add Cypher for internal and external applications.
- **IMPLEMENT**:
```cypher
MATCH (u:User {userId: $userId})-[r:APPLIED_TO]->(j:Job)
OPTIONAL MATCH (j)-[:BELONGS_TO]->(c:Company)
WHERE coalesce(r.archived, false) = $archived
RETURN j, c, r
ORDER BY coalesce(r.followUpAt, r.appliedAt) ASC, r.appliedAt DESC
```
  Add optional filtering by `candidateStatus`, `source`, and search text over job title/company name.
- **MIRROR**: Conditional query construction in `getAllJobs`.
- **IMPORTS**: none.
- **GOTCHA**: Neo4j `datetime` values should be returned as strings using `value?.toString()` before sending to React.
- **VALIDATE**: Confirm applications created by current `applyToJob` appear with `candidateStatus: 'APPLIED'`.

### Task 4: Add Candidate Update and Archive Queries
- **ACTION**: Update only candidate-owned relationship properties.
- **IMPLEMENT**:
```cypher
MATCH (u:User {userId: $userId})-[r:APPLIED_TO]->(j:Job {jobId: $jobId})
SET r += $updates,
    r.candidateUpdatedAt = datetime()
RETURN r, j
```
  Whitelist fields: `candidateStatus`, `notes`, `followUpAt`, `interviewAt`, `contactName`, `contactEmail`, `contactPhone`, `externalUrl`, `archived`.
- **MIRROR**: `recruiterRepository.updateJob` allowed-field filtering.
- **IMPORTS**: none.
- **GOTCHA**: Never allow request body to set `status`, `cvUrl`, `cvType`, or `appliedAt`.
- **VALIDATE**: Attempt to send `status: 'HIRED'` in candidate update; official status must remain unchanged.

### Task 5: Add External Application Creation
- **ACTION**: Create hidden tracked job/company nodes and an `APPLIED_TO` relationship.
- **IMPLEMENT**:
```cypher
MATCH (u:User {userId: $userId})
MERGE (c:Company {name: $companyName})
  ON CREATE SET c.companyId = $companyId, c.createdAt = datetime(), c.source = 'external'
CREATE (j:Job {
  jobId: $jobId,
  title: $title,
  location: $location,
  status: 'TRACKED',
  source: 'external',
  externalUrl: $externalUrl,
  postedAt: datetime()
})
CREATE (j)-[:BELONGS_TO]->(c)
CREATE (u)-[r:APPLIED_TO {
  cvType: 'external',
  cvUrl: '',
  coverLetter: '',
  status: 'PENDING',
  candidateStatus: $candidateStatus,
  notes: $notes,
  followUpAt: $followUpAt,
  contactName: $contactName,
  contactEmail: $contactEmail,
  appliedAt: coalesce($appliedAt, datetime()),
  source: 'external'
}]->(j)
RETURN j, c, r
```
- **MIRROR**: `recruiterRepository.createCompany` uuid pattern and `jobRepository.applyToJob` relationship shape.
- **IMPORTS**: `const { v4: uuidv4 } = require('uuid');`
- **GOTCHA**: `MERGE (c:Company {name: $companyName})` may attach to an existing company name; acceptable for V1, but include `source` in response so UI can show external/manual.
- **VALIDATE**: External applications do not appear in public `/v1/jobs` because status is not `ACTIVE`.

### Task 6: Add Controller Endpoints
- **ACTION**: Update `backend/src/controllers/jobController.js`.
- **IMPLEMENT**:
  - `getMyApplications(req, res, next)`
  - `createExternalApplication(req, res, next)`
  - `updateMyApplication(req, res, next)`
  - `archiveMyApplication(req, res, next)`
  Validate candidate-only access with `req.user.role === 'CANDIDATE'`.
- **MIRROR**: `getRecommendedJobs` role check and JSON response shape.
- **IMPORTS**: Existing `jobRepository`.
- **GOTCHA**: Return 403 for recruiters/admins; this is candidate-owned state.
- **VALIDATE**: Use a recruiter token and confirm it cannot access candidate tracker endpoints.

### Task 7: Wire Routes Safely
- **ACTION**: Update `backend/src/routes/jobRoutes.js`.
- **IMPLEMENT**:
```javascript
router.get('/applications', authMiddleware.verifyToken, jobController.getMyApplications);
router.post('/applications/external', authMiddleware.verifyToken, jobController.createExternalApplication);
router.patch('/applications/:jobId', authMiddleware.verifyToken, jobController.updateMyApplication);
router.patch('/applications/:jobId/archive', authMiddleware.verifyToken, jobController.archiveMyApplication);
```
  Place these after `/recommended` and before `/:id`.
- **MIRROR**: Current saved/recommended route ordering.
- **IMPORTS**: none.
- **GOTCHA**: If placed after `/:id`, all application routes break.
- **VALIDATE**: `GET /v1/jobs/applications` must not call `getJobById('applications')`.

### Task 8: Create Frontend Application Service
- **ACTION**: Add `client/src/services/applicationService.js`.
- **IMPLEMENT**:
  - `getMyApplications(token, filters = {})`
  - `createExternalApplication(token, data)`
  - `updateMyApplication(token, jobId, data)`
  - `archiveMyApplication(token, jobId, archived = true)`
- **MIRROR**: `client/src/services/recruiterService.js` JSON result/error pattern and `jobService.js` query param building.
- **IMPORTS**: none.
- **GOTCHA**: Return `result.data` for successful calls to match existing service conventions.
- **VALIDATE**: Inspect Network tab for correct Authorization header and query string.

### Task 9: Build Application Tracker Page
- **ACTION**: Create `client/src/pages/Applications/ApplicationTracker.jsx`.
- **IMPLEMENT**:
  - Load token and user from localStorage.
  - Redirect or show login CTA if no token.
  - Show stats from loaded data: total active, interviewing, offers, follow-up due.
  - Sidebar/top filters: `All`, `APPLIED`, `FOLLOW_UP`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`, source filter, search input, archived toggle.
  - Application cards/list with company logo fallback, role, company, official status pill, candidate status pill, applied date, next follow-up/interview.
  - Detail drawer/modal for notes, contact fields, dates, external URL, archive action.
  - Manual external application modal.
- **MIRROR**: Loading/empty/list state in `ProfileSavedJobs`; status pill style from recruiter status config.
- **IMPORTS**: `React`, `useCallback`, `useEffect`, `useMemo`, `useState`, `Link`, `useNavigate`, service functions, `AppHeader`.
- **GOTCHA**: The page must not mutate `officialStatus`; update only candidate fields.
- **VALIDATE**: Candidate can edit notes and see the card update without full page reload.

### Task 10: Add Routes and Navigation
- **ACTION**: Update `client/src/App.jsx` and `client/src/components/AppHeader/AppHeader.jsx`.
- **IMPLEMENT**:
  - Import `ApplicationTracker`.
  - Add `<Route path="/applications" element={<ApplicationTracker />} />`.
  - In `AppHeader`, add `{ key: 'applications', label: 'Applications', to: '/applications', guest: false }` for logged-in candidates.
- **MIRROR**: Existing recruiter-only dashboard nav push.
- **IMPORTS**: `ApplicationTracker`.
- **GOTCHA**: Do not show candidate tracker to guests; if the user role is absent but token exists, either show the link or let page enforce auth. Preferred: show only when `user.role?.toUpperCase() === 'CANDIDATE'`.
- **VALIDATE**: Candidate sees link; recruiter does not see candidate tracker link.

### Task 11: Improve Apply Success Path
- **ACTION**: Update `client/src/pages/JobSearch/JobSearch.jsx`.
- **IMPLEMENT**:
  - After successful apply, keep current success message.
  - Add an inline link/button in the success state: `Manage applications` -> `/applications`.
  - Keep `onApplied` setting `hasApplied: true`.
- **MIRROR**: Current `ApplyModal` local state and modal close behavior.
- **IMPORTS**: `Link` is already imported in `JobSearch.jsx`.
- **GOTCHA**: Do not auto-navigate after applying; users may want to keep browsing.
- **VALIDATE**: Apply modal still closes after timeout, and link works if clicked before close.

### Task 12: Add Profile Cross-Link
- **ACTION**: Update `client/src/pages/Profile/ProfileSavedJobs.jsx`.
- **IMPLEMENT**: Add a small secondary action near empty state and/or card actions: `Xem ung tuyen cua toi` linking to `/applications`.
- **MIRROR**: Existing `Link to="/jobs"` action.
- **IMPORTS**: `Link` is already imported.
- **GOTCHA**: Keep saved jobs behavior unchanged.
- **VALIDATE**: Saved jobs page renders with no runtime import changes.

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| List internal application | Existing `APPLIED_TO` relationship from apply flow | Returned with `source: internal`, official status, candidate status `APPLIED` | No |
| Update candidate notes | `{ notes: 'Follow up Friday' }` | Relationship gains notes and candidate updated timestamp | No |
| Reject official status overwrite | `{ status: 'HIRED' }` | `r.status` remains unchanged | Yes |
| Create external application | Company/title/appliedAt fields | Hidden `Job` with `status: TRACKED`, visible in tracker, absent from public jobs | Yes |
| Archive application | `archived: true` | Default list excludes it; archived filter includes it | Yes |
| Recruiter token access | Recruiter JWT | 403 for candidate endpoints | Yes |

### Edge Cases Checklist
- [ ] Empty application list
- [ ] Existing internal application without `candidateStatus`
- [ ] External company name matches existing company
- [ ] Follow-up date in the past
- [ ] Invalid date string
- [ ] Missing external title/company
- [ ] Archived application restore
- [ ] Candidate attempts to update another user's application
- [ ] Recruiter official status changes after candidate added notes

---

## Validation Commands

### Static Analysis
```bash
node --check backend/src/controllers/jobController.js
node --check backend/src/repositories/jobRepository.js
node --check backend/src/routes/jobRoutes.js
```
EXPECT: Zero syntax errors

### Frontend Lint
```bash
cd client
npm run lint
```
EXPECT: No lint errors in changed files

### Frontend Build
```bash
cd client
npm run build
```
EXPECT: Production build completes

### Backend Smoke Validation
```bash
cd backend
node test_apply_cv.js
```
EXPECT: Existing apply flow still creates `APPLIED_TO` and recruiter applicant listing still works

### Manual API Validation
```bash
GET /v1/jobs/applications
POST /v1/jobs/applications/external
PATCH /v1/jobs/applications/:jobId
PATCH /v1/jobs/applications/:jobId/archive
```
EXPECT: Candidate token succeeds; recruiter/guest access fails

### Browser Validation
```bash
cd client
npm run dev
```
EXPECT: `/applications` loads, filters work, edits persist, manual external application appears, archived items hide/show correctly

### Manual Validation
- [ ] Apply to an internal job and confirm it appears in `/applications`.
- [ ] Update candidate status to `INTERVIEW` and add notes.
- [ ] Add follow-up date and verify stats count it.
- [ ] Create an external application.
- [ ] Archive and restore an application.
- [ ] Confirm recruiter applicants page still shows official status and CV fields.

---

## Acceptance Criteria
- [ ] Candidate users can open `/applications`.
- [ ] Tracker lists all internal applications created through the existing apply flow.
- [ ] Candidate users can create manually tracked external applications.
- [ ] Candidate users can update only candidate-owned fields.
- [ ] Recruiter-owned `r.status` remains unchanged by candidate edits.
- [ ] Candidate users can filter by status, source, search term, and archived state.
- [ ] Tracker shows useful stats: total active, interviewing, offer, follow-up due.
- [ ] Apply success includes a path to manage applications.
- [ ] Header navigation exposes the tracker for candidates.
- [ ] Saved jobs remains separate and unchanged.

## Completion Checklist
- [ ] Code follows existing repository/controller/service patterns.
- [ ] Route order protects `/applications` from `/:id`.
- [ ] Error handling matches controller style.
- [ ] Candidate updates whitelist fields.
- [ ] External applications do not appear in public job search.
- [ ] UI follows existing Tailwind and Material Symbols patterns.
- [ ] No hardcoded user ids or tokens.
- [ ] Documentation/comments updated only where useful.
- [ ] No unnecessary scope additions.
- [ ] Self-contained; no additional codebase searching needed during implementation.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Route conflict with `/:id` | Medium | High | Add application routes before `/:id` and test URL resolution |
| Candidate overwrites recruiter status | Medium | High | Use `candidateStatus`; whitelist updates and reject `status` |
| External tracked jobs pollute public jobs | Medium | Medium | Set `j.status = 'TRACKED'` and preserve public query `j.status = 'ACTIVE'` |
| Neo4j datetime serialization issues | Medium | Medium | Convert values with `toString()` before JSON response |
| Header role data missing in localStorage | Low | Low | Page enforces auth/role even if nav link visibility is imperfect |

## Notes
- Best menu label for the product is `Applications` in English UI, or `Ung tuyen cua toi` if localized Vietnamese copy is preferred.
- Suggested candidate statuses: `APPLIED`, `FOLLOW_UP`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`.
- Existing official statuses from recruiters remain: `PENDING`, `SHORTLISTED`, `INTERVIEWED`, `REJECTED`, `HIRED`.
- Consider a later V2 for reminders, calendar sync, offer comparison, and AI follow-up suggestions.

---

## Plan Created

- **File**: `.claude/PRPs/plans/application-tracker.plan.md`
- **Source PRD**: N/A
- **Phase**: standalone
- **Complexity**: Large
- **Scope**: 8 files, 12 tasks
- **Key Patterns**: `APPLIED_TO` relationship, Express controller/repository split, React candidate list state
- **External Research**: none needed
- **Risks**: route conflict with `/:id`, candidate/recruiter status ownership, external jobs polluting search
- **Confidence Score**: 8/10 - existing application data model is strong, but external tracking needs careful additive properties

> Next step: Run `/prp-implement .claude/PRPs/plans/application-tracker.plan.md` to execute this plan.

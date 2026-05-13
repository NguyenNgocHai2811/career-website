# Plan: Candidate Job Recommendations

## Summary
Add a candidate-facing job recommendation mode powered by the existing Neo4j graph. The first version ranks active jobs by matched skills and location fit, returns explainable match metadata, and surfaces the results inside the existing Job Search page so candidates can move directly from discovery to detail/apply/save.

## User Story
As a candidate, I want to see jobs recommended from my profile skills and location, so that I can find relevant opportunities faster without manually tuning filters every time.

## Problem -> Solution
The app currently supports public job search and saved/applied jobs, but no personalized candidate job recommendations. Add an authenticated recommendation endpoint using `User-[:HAS_SKILL]->Skill` and `Job-[:REQUIRES_SKILL]->Skill`, enrich job creation/editing so jobs actually maintain skill relationships, and add a "Recommended for you" mode in `/jobs`.

## Metadata
- **Complexity**: Large
- **Source PRD**: N/A
- **PRD Phase**: N/A
- **Estimated Files**: 8-10

---

## UX Design

### Before
```text
/jobs
+ Search hero
+ Keyword/location filters
+ Sidebar filters
+ Job grid sorted by postedAt
+ Detail pane when selecting a job
```

### After
```text
/jobs
+ Search hero
+ Mode switch: All jobs | Recommended for you
+ Recommended mode uses candidate profile skills/location
+ Job cards show match score and reason chips
+ Detail pane shows why this job matches
+ If no profile skills exist, show an empty state linking to profile skills
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| `/jobs` first screen | All active jobs only | Candidate can switch to recommended jobs | Keep all-job search as default for anonymous and recruiter users |
| Job card | Title, company, location, salary | Also shows match score and reason chips when recommendation metadata exists | Reuse existing `JobCard` shape |
| Job detail | Description and required skills | Also shows recommendation reasons for recommended jobs | Do not block apply/save |
| Recruiter post/edit job | No required skills input | Add comma-separated or chip-based required skills field | Needed so graph recommendations have real skill data |
| Candidate profile | Skills already editable | Empty recommendation state links user to add skills | No profile redesign |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `backend/src/repositories/jobRepository.js` | 3-130 | Existing job search, job detail, `REQUIRES_SKILL` read pattern |
| P0 | `backend/src/controllers/jobController.js` | 5-142 | Existing job response format and try/catch/next style |
| P0 | `backend/src/routes/jobRoutes.js` | 8-23 | Route ordering; `/recommended` must be registered before `/:id` |
| P0 | `client/src/pages/JobSearch/JobSearch.jsx` | 333-430, 493-870 | Existing state, fetch, grid, selected detail, apply/save flows |
| P0 | `client/src/services/jobService.js` | 4-90 | Fetch wrapper style for job APIs |
| P1 | `backend/src/repositories/userRepository.js` | 87-91, 434-441 | Candidate skill graph source |
| P1 | `backend/src/repositories/recruiterRepository.js` | 74-121, 270-291 | Job creation/update does not currently write skill relationships |
| P1 | `client/src/pages/Recruiter/RecruiterDashboard.jsx` | 432-545, 801-940 | Recruiter post/edit forms that need required skill input |
| P1 | `backend/src/middlewares/authMiddleware.js` | 5-34 | Required vs optional auth behavior |
| P2 | `backend/src/repositories/networkRepository.js` | 63-94 | Existing graph-based suggestion pattern and result mapping |
| P2 | `backend/seed_v4_correct_data.js` | 114-184 | Seed jobs lack `REQUIRES_SKILL`; backfill needed for demo data |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Neo4j JavaScript sessions | https://neo4j.com/docs/api/javascript-driver/current/class/lib6/session.js~Session.html | `session.run(query, params)` is supported and sessions should be closed after use |
| Neo4j JS driver manual | https://neo4j.com/docs/javascript-manual/current/ | Use parameter placeholders rather than string-concatenating values |
| Cypher optional matches | https://neo4j.com/docs/cypher-cheat-sheet/4/neo4j-community/ | `OPTIONAL MATCH` keeps rows when optional graph data is missing |

KEY_INSIGHT: The repo already uses one shared driver and per-method sessions with `finally { await session.close(); }`; mirror that instead of introducing a new Neo4j abstraction.
APPLIES_TO: `jobRepository.getRecommendedJobsForCandidate`.
GOTCHA: Do not put `/recommended` after `/:id` in Express routes, or it will be treated as a job id.

---

## Patterns to Mirror

### NAMING_CONVENTION
// SOURCE: `backend/src/repositories/jobRepository.js:3-13`
```js
const getAllJobs = async (filters = {}) => {
  const session = driver.session();
  try {
    let query = `
      MATCH (j:Job)-[:BELONGS_TO]->(c:Company)
      WHERE j.status = 'ACTIVE'
    `;
```

Use `getRecommendedJobs` or `getRecommendedJobsForCandidate` in the repository and `getRecommendedJobs` in the controller/service to match existing verb-noun style.

### ERROR_HANDLING
// SOURCE: `backend/src/controllers/jobController.js:5-12`
```js
const getJobs = async (req, res, next) => {
  try {
    const filters = req.query;
    const jobs = await jobRepository.getAllJobs(filters);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};
```

Keep controller errors routed to `next(error)` and return `{ success: true, data }` on success.

### LOGGING_PATTERN
// SOURCE: `backend/src/controllers/jobController.js:84-91`
```js
} catch (notifErr) {
  console.error('Notification error (applyToJob):', notifErr);
}
```

Only log exceptional side-effect failures. Recommendation reads should normally not log per request unless an error is being passed to middleware.

### REPOSITORY_PATTERN
// SOURCE: `backend/src/repositories/jobRepository.js:107-130`
```js
const getJobById = async (jobId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (j:Job {jobId: $jobId})
      OPTIONAL MATCH (j)-[:BELONGS_TO]->(c:Company)
      OPTIONAL MATCH (j)-[r:REQUIRES_SKILL]->(s:Skill)
      RETURN j, c, collect({ name: s.name, weight: r.weight }) AS skills
    `;
```

Use Cypher parameters, `OPTIONAL MATCH` for enrichment, map Neo4j records to plain objects, and close the session in `finally`.

### GRAPH_SUGGESTION_PATTERN
// SOURCE: `backend/src/repositories/networkRepository.js:63-94`
```js
OPTIONAL MATCH (me)-[:CONNECTED_WITH {status: 'ACCEPTED'}]-(mutual:User)-[:CONNECTED_WITH {status: 'ACCEPTED'}]-(u)
WITH u, collect(DISTINCT mutual.fullName) AS mutualNames
WITH
  u,
  size(mutualNames) AS mutualConnectionsCount,
  [name IN mutualNames WHERE name IS NOT NULL][0..3] AS mutualConnectionNames
RETURN
  u.userId AS id,
  u.fullName AS fullName,
  mutualConnectionsCount,
  mutualConnectionNames
ORDER BY mutualConnectionsCount DESC, u.fullName ASC
LIMIT 10
```

Recommendation query should collect explainable matches first, derive counts/reasons in Cypher, then order by score.

### FRONTEND_SERVICE_PATTERN
// SOURCE: `client/src/services/jobService.js:4-16`
```js
export const getJobs = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const qs = params.toString();
    const response = await fetch(`${API_URL}${qs ? `?${qs}` : ''}`);
```

Add `getRecommendedJobs(token, options = {})` next to existing job service methods.

### FRONTEND_STATE_PATTERN
// SOURCE: `client/src/pages/JobSearch/JobSearch.jsx:333-399`
```js
const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedJob, setSelectedJob] = useState(null);
const [page, setPage] = useState(1);
...
const fetchJobs = async () => {
  setLoading(true);
  try {
    const data = await getJobs(filters);
    setJobs(data || []);
    setPage(1);
```

Add recommendation state with the same loading/error discipline and reset pagination when switching modes.

### TEST_STRUCTURE
No automated test files are currently present under `backend` or `client` (`rg --files -g "*.test.*" -g "*.spec.*" backend client` returned none). Add focused tests only if a test harness is established during implementation; otherwise validate with build/lint and manual API checks.

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `backend/src/repositories/jobRepository.js` | UPDATE | Add `getRecommendedJobsForCandidate(userId, options)` using skill/location graph scoring |
| `backend/src/controllers/jobController.js` | UPDATE | Add authenticated `getRecommendedJobs` controller |
| `backend/src/routes/jobRoutes.js` | UPDATE | Add `GET /recommended` before `/:id` |
| `client/src/services/jobService.js` | UPDATE | Add client API helper for recommended jobs |
| `client/src/pages/JobSearch/JobSearch.jsx` | UPDATE | Add mode switch, recommended fetch, score/reasons UI |
| `backend/src/repositories/recruiterRepository.js` | UPDATE | Write/update `REQUIRES_SKILL` relationships when jobs include required skills |
| `client/src/pages/Recruiter/RecruiterDashboard.jsx` | UPDATE | Add required skills input to post/edit job forms |
| `client/src/services/recruiterService.js` | UPDATE | Pass `skills`/`requiredSkills` unchanged in existing JSON body |
| `backend/scripts/backfill-job-skills.js` | CREATE | Optional dev script to populate `REQUIRES_SKILL` for existing seed/demo jobs |
| `README.md` or `.claude/PRPs/plans/...` notes | UPDATE if needed | Document validation command or backfill script if implementation adds it |

## NOT Building

- AI-generated explanations or LLM ranking.
- Recruiter-side candidate recommendations.
- Neo4j Graph Data Science plugin algorithms.
- Full search personalization from saved/applied history.
- New standalone recommendations page.
- Advanced weight tuning UI.

---

## Recommendation Design

### API Contract

`GET /v1/jobs/recommended?limit=20`

Auth: `verifyToken`.

Response:
```json
{
  "success": true,
  "data": [
    {
      "jobId": "job_123",
      "title": "Frontend Developer",
      "location": "Ha Noi",
      "company": { "companyId": "comp_1", "name": "FPT Software" },
      "skills": [{ "name": "React", "weight": 5 }],
      "matchScore": 85,
      "matchedSkills": ["React", "JavaScript"],
      "missingSkills": ["Node.js"],
      "locationMatch": true,
      "recommendationReasons": [
        "Matches 2 required skills",
        "Same location as your profile"
      ],
      "isSaved": false,
      "hasApplied": false
    }
  ],
  "meta": {
    "source": "profile",
    "candidateSkillCount": 4,
    "candidateLocation": "Ha Noi"
  }
}
```

### Scoring

Initial deterministic score:
- Skill score: up to 80 points.
  - Required skill weights come from `REQUIRES_SKILL.weight`; default to 1 when missing.
  - `skillScore = round(80 * matchedWeight / totalJobSkillWeight)`.
  - If a job has no required skill graph, skill score is 0.
- Location score: 20 points.
  - `true` when candidate location and job/company location match case-insensitively or one contains the other.
  - Treat `Remote` job location as location match.
- Final score: `skillScore + locationScore`.

Ordering:
1. `matchScore DESC`
2. `matchedSkillCount DESC`
3. `j.postedAt DESC`

Exclusions:
- Exclude jobs already applied by the user.
- Do not exclude saved jobs; return `isSaved: true`.
- Exclude jobs posted by the same user.
- Only active jobs.

Cold start:
- If candidate has no skills and no location, return empty `data` plus meta and let UI prompt profile completion.
- If no skills but location exists, return location-based matches with reason "Matches your location" and lower scores.

---

## Step-by-Step Tasks

### Task 1: Add backend recommendation query
- **ACTION**: Update `backend/src/repositories/jobRepository.js`.
- **IMPLEMENT**: Add `getRecommendedJobsForCandidate(userId, { limit = 20 } = {})`.
- **MIRROR**: Existing `getAllJobs` and `getJobById` session/record mapping.
- **IMPORTS**: No new imports.
- **GOTCHA**: Convert Neo4j integers with `Number(value || 0)` or `.toNumber?.()` when needed; frontend should receive JS numbers.
- **VALIDATE**: Direct API call returns active jobs ordered by `matchScore` and includes `company`, `skills`, `matchedSkills`, `missingSkills`, `recommendationReasons`, `isSaved`, `hasApplied`.

Suggested Cypher shape:
```cypher
MATCH (u:User {userId: $userId})
OPTIONAL MATCH (u)-[:HAS_SKILL]->(us:Skill)
WITH u, collect(DISTINCT toLower(trim(us.name))) AS userSkills
MATCH (j:Job)-[:BELONGS_TO]->(c:Company)
WHERE j.status = 'ACTIVE'
  AND NOT (u)-[:APPLIED_TO]->(j)
  AND NOT (u)-[:POSTED]->(j)
OPTIONAL MATCH (j)-[req:REQUIRES_SKILL]->(js:Skill)
WITH u, j, c, userSkills,
     collect(DISTINCT { name: js.name, key: toLower(trim(js.name)), weight: coalesce(req.weight, 1) }) AS requiredSkills
WITH u, j, c, userSkills,
     [s IN requiredSkills WHERE s.name IS NOT NULL] AS requiredSkills
WITH u, j, c, userSkills, requiredSkills,
     [s IN requiredSkills WHERE s.key IN userSkills] AS matchedSkills,
     [s IN requiredSkills WHERE NOT s.key IN userSkills] AS missingSkills
WITH u, j, c, userSkills, requiredSkills, matchedSkills, missingSkills,
     reduce(total = 0, s IN requiredSkills | total + s.weight) AS totalWeight,
     reduce(total = 0, s IN matchedSkills | total + s.weight) AS matchedWeight,
     (
       toLower(coalesce(j.location, '')) CONTAINS toLower(coalesce(u.location, ''))
       OR toLower(coalesce(u.location, '')) CONTAINS toLower(coalesce(j.location, ''))
       OR toLower(coalesce(j.location, '')) CONTAINS 'remote'
     ) AS locationMatch
WITH u, j, c, requiredSkills, matchedSkills, missingSkills, locationMatch,
     CASE WHEN totalWeight > 0 THEN round(80.0 * matchedWeight / totalWeight) ELSE 0 END AS skillScore
WITH u, j, c, requiredSkills, matchedSkills, missingSkills, locationMatch,
     toInteger(skillScore) + CASE WHEN locationMatch THEN 20 ELSE 0 END AS matchScore
WHERE matchScore > 0
OPTIONAL MATCH (u)-[saved:SAVED_JOB]->(j)
RETURN j, c,
       [s IN requiredSkills | { name: s.name, weight: s.weight }] AS skills,
       [s IN matchedSkills | s.name] AS matchedSkills,
       [s IN missingSkills | s.name][0..5] AS missingSkills,
       locationMatch,
       matchScore,
       saved IS NOT NULL AS isSaved,
       false AS hasApplied,
       size(userSkills) AS candidateSkillCount,
       u.location AS candidateLocation
ORDER BY matchScore DESC, size(matchedSkills) DESC, j.postedAt DESC
LIMIT $limit
```

### Task 2: Add controller and route
- **ACTION**: Update `backend/src/controllers/jobController.js` and `backend/src/routes/jobRoutes.js`.
- **IMPLEMENT**: Add `getRecommendedJobs` that reads `req.user.userId`, calls repository, and returns `{ success: true, data, meta }`.
- **MIRROR**: `getSavedJobs` controller style and route auth style.
- **IMPORTS**: Existing `authMiddleware.verifyToken`.
- **GOTCHA**: Register route before `router.get('/:id', ...)`.
- **VALIDATE**: `GET /v1/jobs/recommended` without token returns 401; with token returns JSON.

### Task 3: Maintain job skill graph
- **ACTION**: Update `backend/src/repositories/recruiterRepository.js`.
- **IMPLEMENT**:
  - Accept `jobData.skills` or `jobData.requiredSkills` as an array or comma-separated string.
  - Normalize: trim, drop blanks, de-dupe case-insensitively.
  - In `postJob`, after creating the job, `MERGE (s:Skill {name: skillName})` and `MERGE (j)-[:REQUIRES_SKILL {weight: 1}]->(s)`.
  - In `updateJob`, when skills are provided, delete existing `REQUIRES_SKILL` for that job and recreate from normalized list.
- **MIRROR**: `userRepository.addSkill` uses global `Skill` nodes with `MERGE`.
- **IMPORTS**: No new package imports.
- **GOTCHA**: Only replace job skills when the field is present; do not erase skills on unrelated edits.
- **VALIDATE**: After posting a job with skills, `getJobById` returns those skills.

### Task 4: Add recruiter skill input
- **ACTION**: Update `client/src/pages/Recruiter/RecruiterDashboard.jsx`.
- **IMPLEMENT**:
  - Extend `form` and `EMPTY_EDIT_FORM` with `skills: ''`.
  - Add input labeled `Required Skills` near Job Details.
  - Helper text can be placeholder-only, e.g. `React, Node.js, SQL`.
  - On edit, populate from `job.skills` if available; otherwise keep empty.
- **MIRROR**: Existing controlled input style in post/edit forms.
- **IMPORTS**: None.
- **GOTCHA**: Do not make skills required for posting, because existing jobs may not have skills yet.
- **VALIDATE**: Posting/editing sends `skills` in existing JSON body and does not break job creation.

### Task 5: Add client recommendation service
- **ACTION**: Update `client/src/services/jobService.js`.
- **IMPLEMENT**: Add:
```js
export const getRecommendedJobs = async (token, options = {}) => {
  const params = new URLSearchParams();
  Object.keys(options).forEach(key => {
    if (options[key]) params.append(key, options[key]);
  });
  const qs = params.toString();
  const response = await fetch(`${API_URL}/recommended${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to fetch recommended jobs');
  return result;
};
```
- **MIRROR**: `getSavedJobs` auth header style and `getJobs` querystring style.
- **IMPORTS**: None.
- **GOTCHA**: Return the full result so UI can read `meta`, not only `result.data`.
- **VALIDATE**: Import works in `JobSearch.jsx`.

### Task 6: Add recommended mode to Job Search UI
- **ACTION**: Update `client/src/pages/JobSearch/JobSearch.jsx`.
- **IMPLEMENT**:
  - Import `getRecommendedJobs`.
  - Add `const [jobMode, setJobMode] = useState('all');`.
  - If user role is `CANDIDATE`, render a segmented mode switch above the grid: `Tat ca viec lam` and `Goi y cho ban`.
  - In recommended mode, fetch `getRecommendedJobs(token, { limit: 60 })`; otherwise use existing `getJobs(filters)`.
  - Disable or de-emphasize sidebar filters in recommended mode, or show a short status line that recommendations use profile skills/location.
  - Show empty state linking to `/profile` when meta shows `candidateSkillCount === 0`.
- **MIRROR**: Existing `fetchJobs`, `loading`, pagination, and `clearFilters` patterns.
- **IMPORTS**: `getRecommendedJobs` from job service.
- **GOTCHA**: `fetchJobs` useEffect dependencies must include `jobMode`; avoid infinite loops from setting state used by dependencies unnecessarily.
- **VALIDATE**: Candidate can switch modes, recruiter/anonymous users still see existing search.

### Task 7: Show score and reasons on cards/detail
- **ACTION**: Update `JobCard` and selected job detail in `JobSearch.jsx`.
- **IMPLEMENT**:
  - If `job.matchScore !== undefined`, show a compact match badge.
  - Render up to 2 reason chips from `recommendationReasons`.
  - In detail pane, show a `Why this matches` section before description when present.
- **MIRROR**: Existing tag/chip classes near `job.level`, `job.category`, and detail skill chips.
- **IMPORTS**: None.
- **GOTCHA**: Existing `JobCard` is used for all jobs; guard every recommendation field.
- **VALIDATE**: All-job cards render unchanged when metadata is absent.

### Task 8: Backfill demo job skills
- **ACTION**: Create `backend/scripts/backfill-job-skills.js` or update seed data if preferred.
- **IMPLEMENT**:
  - Map known categories/titles to skills.
  - For each active job, assign 3-5 skills with `MERGE (s:Skill {name}) MERGE (j)-[:REQUIRES_SKILL {weight}]->(s)`.
  - Reuse `driver` from `../src/config/neo4j`.
- **MIRROR**: `backend/scripts/seed-admin.js` and existing seed scripts session/finally style.
- **IMPORTS**: `const { driver } = require('../src/config/neo4j');`.
- **GOTCHA**: Script is for development/demo data, not automatically run on server startup.
- **VALIDATE**: `MATCH (:Job)-[:REQUIRES_SKILL]->(:Skill) RETURN count(*)` returns > 0.

---

## Testing Strategy

### Unit Tests

There is no current unit test structure. If adding tests during implementation is practical, use Jest for backend repository/controller behavior with mocked Neo4j session. Otherwise rely on the validation commands and manual API checks below.

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| Recommendation with skills and location | Candidate with React skill and Ha Noi location | Jobs with React/Ha Noi rank highest | No |
| Candidate without skills | Candidate has location only | Location matches returned with lower scores or profile prompt | Yes |
| Already applied job | Candidate has `APPLIED_TO` relation | Job excluded | Yes |
| Saved job | Candidate has `SAVED_JOB` relation | Job included with `isSaved: true` | Yes |
| Job has no required skills | Active job with location match | Can receive location-only score | Yes |

### Edge Cases Checklist
- [ ] Candidate has no skills.
- [ ] Candidate has no location.
- [ ] Job has no `REQUIRES_SKILL` relationships.
- [ ] Skill casing differs (`React` vs `react`).
- [ ] Job location is `Remote`.
- [ ] Candidate has already applied to a matching job.
- [ ] User is not authenticated.
- [ ] User is recruiter/admin, not candidate.
- [ ] Limit query param is missing or too large.

---

## Validation Commands

### Static Analysis
```bash
cd client && npm run lint
```
EXPECT: Zero lint errors for modified frontend code.

### Build
```bash
npm run build
```
EXPECT: Client build succeeds. Run from `client/`.

### Backend Smoke
```bash
cd backend && npm test
```
EXPECT: Currently exits with "Error: no test specified"; do not treat as feature validation until test script exists.

### API Validation
```bash
curl -H "Authorization: Bearer <candidate-token>" http://localhost:3000/v1/jobs/recommended
```
EXPECT: `success: true`, `data` array, recommendation metadata present.

### Database Validation
```cypher
MATCH (:Job)-[r:REQUIRES_SKILL]->(:Skill)
RETURN count(r) AS jobSkillRelationships;
```
EXPECT: Count greater than 0 after recruiter creates skill-tagged jobs or backfill script runs.

### Browser Validation
```bash
cd client && npm run dev
```
EXPECT: `/jobs` loads, candidate sees the recommendation mode, switching modes fetches relevant jobs, apply/save still work.

### Manual Validation
- [ ] Login as candidate with skills and location.
- [ ] Visit `/jobs`.
- [ ] Switch to recommended mode.
- [ ] Confirm score/reason chips appear.
- [ ] Open a recommended job detail.
- [ ] Confirm required skills and explanation render.
- [ ] Save a recommended job and confirm the saved state updates.
- [ ] Apply to a recommended job and confirm it disappears on next recommendation fetch.
- [ ] Login as recruiter and post/edit a job with required skills.
- [ ] Confirm the job can be recommended to a candidate with matching skills.

---

## Acceptance Criteria

- [ ] Candidate can fetch personalized recommended jobs from `GET /v1/jobs/recommended`.
- [ ] Recommendations use Neo4j graph relationships for skill matching.
- [ ] Location contributes to score and explanation.
- [ ] Applied jobs are excluded.
- [ ] Saved jobs are marked.
- [ ] `/jobs` UI exposes recommendations for candidate users.
- [ ] Job cards/detail show match score and reasons only when available.
- [ ] Recruiter job create/edit can maintain required job skills.
- [ ] Existing public job search still works.
- [ ] Build/lint validation passes or any existing unrelated failures are documented.

## Completion Checklist

- [ ] Code follows discovered repository/controller/service patterns.
- [ ] Route order keeps `/recommended` before `/:id`.
- [ ] Error handling matches existing `try/catch next(error)` style.
- [ ] Sessions are closed in `finally`.
- [ ] Cypher uses parameters for user input.
- [ ] Recommendation metadata is guarded in UI.
- [ ] No AI dependency added for MVP.
- [ ] No new standalone page unless explicitly requested later.
- [ ] Plan is self-contained enough for implementation.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Existing jobs lack `REQUIRES_SKILL` | High | Recommendations become location-only | Add recruiter skill input and backfill script |
| Location matching is fuzzy | Medium | Some imperfect matches | Use conservative case-insensitive contains and treat Remote as match |
| Large query gets slow with many jobs | Low now, Medium later | Slow `/jobs/recommended` | Limit results, later add indexes/constraints and precomputed scores if needed |
| Frontend `JobSearch.jsx` is large | Medium | Risky edits | Keep changes localized to service import, mode state, fetch branch, and guarded metadata rendering |
| No automated tests | High | Regression risk | Use manual API/browser validation and add focused tests if test setup is enabled |

## Notes

- UI placement recommendation: put this in `/jobs`, not Feed/Profile. Job Search is where users already compare and act on jobs; Profile is better as a profile-completion source, and Feed would make the feature feel incidental.
- Technical recommendation: use Neo4j/Cypher only for MVP. This is explainable, deterministic, cheaper, and fits the existing data model. Add AI later only to phrase explanations or summarize why a job fits.
- The codebase currently has encoding issues in some Vietnamese strings. Keep new strings simple and verify rendering in browser.

---

## Output

- **File**: `.claude/PRPs/plans/candidate-job-recommendations.plan.md`
- **Source PRD**: N/A
- **Phase**: standalone
- **Complexity**: Large
- **Scope**: 8-10 files, 8 tasks
- **Key Patterns**: Neo4j repository sessions, Express controller response shape, React service/state fetch pattern
- **External Research**: Neo4j JS driver sessions, Cypher optional matching, parameterized queries
- **Risks**: Existing jobs lack skill relationships
- **Confidence Score**: 8/10

Next step: Run `/prp-implement .claude/PRPs/plans/candidate-job-recommendations.plan.md` to execute this plan.

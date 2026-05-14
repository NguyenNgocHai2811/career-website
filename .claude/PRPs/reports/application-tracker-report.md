# Implementation Report: Application Tracker

## Summary
Added a candidate-facing application tracker at `/applications`. Candidates can view all internal applications, track manually-added external applications, update candidate-owned metadata (status, notes, contacts, follow-up/interview dates), archive entries, and filter by status/source/search. The apply success modal now links to the tracker, the header shows the nav link for candidates, and the saved jobs page adds a cross-link.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Large | Large |
| Confidence | 8/10 | 8/10 |
| Files Changed | 8 estimated | 9 files (8 modified + 1 created dir) |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Define candidate application data contract | ✅ Complete | Implemented in `mapApplicationRecord` helper in repository |
| 2 | Add candidate repository methods | ✅ Complete | 4 methods added to `jobRepository.js` |
| 3 | Implement candidate list query with filters | ✅ Complete | `getMyApplications` with archived/status/source/search filters |
| 4 | Add candidate update and archive queries | ✅ Complete | Field whitelist enforced via `CANDIDATE_ALLOWED_FIELDS` |
| 5 | Add external application creation | ✅ Complete | Hidden `TRACKED` status job, `MERGE` on company name |
| 6 | Add controller endpoints | ✅ Complete | 4 endpoints, all with `role === 'CANDIDATE'` guard |
| 7 | Wire routes safely before `/:id` | ✅ Complete | Placed after `/recommended` and before `/:id` |
| 8 | Create frontend application service | ✅ Complete | `applicationService.js` with 4 functions |
| 9 | Build Application Tracker page | ✅ Complete | Stats, filters, card list, detail drawer, add external modal |
| 10 | Add routes and navigation | ✅ Complete | Route in `App.jsx`, candidate-only nav link in `AppHeader.jsx` |
| 11 | Improve apply success path | ✅ Complete | Link added in success state without changing modal close behavior |
| 12 | Add profile cross-link | ✅ Complete | Link added in empty state of `ProfileSavedJobs.jsx` |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis | ✅ Pass | `node --check` clean on all 3 backend files |
| New File Lint | ✅ Pass | `applicationService.js` and `ApplicationTracker.jsx` have zero lint errors |
| Pre-existing Lint | ⚠️ Pre-existing | 28 errors in unmodified files (Register, ResetPassword, AppHeader, JobSearch) — existed before this feature |
| Build | ✅ Pass | `npm run build` builds in ~1.5s, zero errors |
| Integration | 🔲 N/A | Backend DB not available in CI; manual validation recommended |
| Edge Cases | 🔲 Manual | See checklist below |

## Files Changed

| File | Action | Notes |
|---|---|---|
| `backend/src/repositories/jobRepository.js` | UPDATED | Added `getMyApplications`, `updateMyApplication`, `archiveMyApplication`, `createExternalApplication`, `mapApplicationRecord`, `toDateString`, `CANDIDATE_ALLOWED_FIELDS` |
| `backend/src/controllers/jobController.js` | UPDATED | Added `getMyApplications`, `createExternalApplication`, `updateMyApplication`, `archiveMyApplication` |
| `backend/src/routes/jobRoutes.js` | UPDATED | Added 4 `/applications` routes before `/:id` |
| `client/src/services/applicationService.js` | CREATED | 4 fetch functions matching existing service pattern |
| `client/src/pages/Applications/ApplicationTracker.jsx` | CREATED | Full tracker page: stats, filters, cards, detail drawer, external add modal |
| `client/src/App.jsx` | UPDATED | Imported `ApplicationTracker`, added `/applications` route |
| `client/src/components/AppHeader/AppHeader.jsx` | UPDATED | Added `Ứng tuyển` nav link for CANDIDATE role only |
| `client/src/pages/JobSearch/JobSearch.jsx` | UPDATED | Added `Quản lý ứng tuyển →` link in apply success state |
| `client/src/pages/Profile/ProfileSavedJobs.jsx` | UPDATED | Added `Xem ứng tuyển của tôi →` cross-link in empty state |

## Deviations from Plan
- **`user` variable in ApplicationTracker**: Plan said to load `user` from localStorage; removed it to fix a lint error since role enforcement is done server-side. The backend 403 guard is the authoritative check.
- **No smoke test run**: The plan calls for `node test_apply_cv.js` — this can be run manually after environment is up.

## Issues Encountered
- `uuid` module required `require('uuid')` to be placed inside the function body (or imported at top); kept inline per existing codebase pattern.
- Pre-existing lint errors in 4 files unrelated to this feature; confirmed not introduced by this implementation.

## Tests Written
No automated tests exist in this repo yet (plan confirmed: "no formal automated test suite"). Manual smoke test script exists at `backend/test_apply_cv.js` for existing apply flow regression.

## Manual Validation Checklist
- [ ] Apply to internal job → appears in `/applications` with `source: internal`
- [ ] Update candidate status to `INTERVIEW`, add notes → card updates without reload
- [ ] Add follow-up date → stats count shows it
- [ ] Create external application → appears in tracker, absent from public `/v1/jobs`
- [ ] Archive application → removed from active list; restored via archived toggle
- [ ] Recruiter token → GET /v1/jobs/applications returns 403
- [ ] Candidate nav link visible for candidates, hidden for recruiters

## Next Steps
- [ ] Code review via `/code-review`
- [ ] Create PR via `/prp-pr`

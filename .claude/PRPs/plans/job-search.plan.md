# Plan: Job Search and Filtering Feature

## Summary
Implement a comprehensive job search and filtering system on the `Jobs` page. This includes backend updates to handle search queries in Neo4j and frontend updates to provide an intuitive search interface.

## User Story
As a job seeker, I want to search for jobs by keyword and location and filter by employment type, so that I can quickly find positions that match my skills and preferences.

## Problem → Solution
Current state: Only shows all active jobs in a list/grid with no way to search or filter.
Desired state: A powerful search bar for keywords and location, combined with multi-select filters for job types, providing real-time results.

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A
- **PRD Phase**: standalone
- **Estimated Files**: 4

---

## UX Design

### Before
┌──────────────────────────────────────────┐
│ [Header: Jobs]                           │
│ Khám phá cơ hội nghề nghiệp mới.         │
│ (Checkboxes for Full-time, etc - Static) │
│ [List of All Jobs]                       │
└──────────────────────────────────────────┘

### After
┌──────────────────────────────────────────┐
│ [Header: Jobs]                           │
│ Khám phá cơ hội nghề nghiệp mới.         │
│ [ Keyword Input ] [ Location Input ] [Btn]│
│                                          │
│ [Filters]        [ Search Results Count ]│
│ [ ] Full-time    [ Job Card 1 ]          │
│ [x] Remote       [ Job Card 2 ]          │
│ [ ] Part-time                            │
└──────────────────────────────────────────┘

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Search Bar | None | Functional input with "Search" button | Triggers new fetch |
| Job Type Checkboxes | Static | Functional multi-select | Refetches jobs on toggle |
| No Results | Shows empty list | Custom "Empty State" UI | Includes "Clear filters" button |

---

## Mandatory Reading

Files that MUST be read before implementing:

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `backend/src/repositories/jobRepository.js` | 3-21 | Core repository to add filter logic |
| P1 (important) | `client/src/pages/JobSearch/JobSearch.jsx` | 286-533 | Main frontend component |
| P2 (reference) | `backend/src/repositories/networkRepository.js` | 59-81 | Example of search query in Cypher |

---

## Patterns to Mirror

### CYPHER_SEARCH_PATTERN
// SOURCE: backend/src/repositories/networkRepository.js:66
```cypher
AND toLower(u.fullName) CONTAINS toLower($term)
```

### REPOSITORY_PATTERN
// SOURCE: backend/src/repositories/jobRepository.js:3-21
```javascript
const getAllJobs = async (filters = {}) => {
  const session = driver.session();
  try {
    // ... logic ...
    const result = await session.run(query, params);
    return result.records.map(record => ({ ... }));
  } finally {
    await session.close();
  }
};
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `backend/src/repositories/jobRepository.js` | UPDATE | Implement filter logic in `getAllJobs` |
| `client/src/services/jobService.js` | VERIFY | Ensure it handles query params (it already does) |
| `client/src/pages/JobSearch/JobSearch.jsx` | UPDATE | Add Search UI and filter logic |

---

## Step-by-Step Tasks

### Task 1: Backend Repository Updates [COMPLETED]
- **ACTION**: Modify `getAllJobs` in `jobRepository.js`.
- **IMPLEMENT**: Add conditional Cypher clauses for `title`, `location`, and `employmentType`. Use `(?i).*search_term.*` regex for case-insensitive partial match or `CONTAINS`.
- **MIRROR**: `CYPHER_SEARCH_PATTERN`.
- **VALIDATE**: Call API with query params and verify returned jobs match.

### Task 2: Frontend State & Search Logic [COMPLETED]
- **ACTION**: Update `JobSearch.jsx` state and fetch function.
- **IMPLEMENT**: 
    - `[keyword, setKeyword]`, `[location, setLocation]`, `[selectedTypes, setSelectedTypes]`.
    - Update `fetchJobs` to pass these as filters to `getJobs`.
    - Trigger `fetchJobs` on form submit and type toggle.
- **MIRROR**: Standard React functional component patterns in the project.
- **VALIDATE**: Log filters in console and verify API call query string.

### Task 3: Search Bar UI Implementation [COMPLETED]
- **ACTION**: Add a search form to `JobSearch.jsx`.
- **IMPLEMENT**: A horizontal bar with keyword input, location input, and a primary action button. Use existing styling tokens (colors like `#4153b4`).
- **VALIDATE**: Visual check on desktop and mobile.

### Task 4: Filter Sidebar & Results Display [COMPLETED]
- **ACTION**: Update the sidebar and main results area.
- **IMPLEMENT**: 
    - Map through job types for checkboxes.
    - Add "Results found" count.
    - Implement "No results" view with a "Clear all filters" button.
- **VALIDATE**: Verify filters correctly update the job list.

---

## Testing Strategy

### Unit Tests
| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| Search by Title | `filters.title = "Developer"` | Jobs with "Developer" in title | No |
| Search by Location | `filters.location = "Remote"` | Jobs in Remote location | No |
| Filter by Multiple Types | `filters.employmentType = "Full-time,Remote"` | Jobs matching either type | Yes |
| No Results | `filters.title = "NonExistent"` | Empty array | Yes |

---

## Validation Commands

### Static Analysis
```bash
# Verify no syntax errors in changed files
node -c backend/src/repositories/jobRepository.js
```

### Manual Validation
- [ ] Search for a known job title.
- [ ] Search for a known location.
- [ ] Toggle multiple employment types and verify the list updates.
- [ ] Search for a string that matches nothing and see the "Empty State".
- [ ] Click "Clear all filters" and see the full list again.

---

## Acceptance Criteria
- [x] Users can search jobs by title/keyword.
- [x] Users can search jobs by location.
- [x] Users can filter jobs by one or more employment types.
- [x] Results update correctly when filters change.
- [x] UI is responsive and follows existing design aesthetics.
- [x] No regression in existing job application functionality.

---

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cypher Query Performance | Low | Low | Use `LIMIT 100` and ensure indexed properties (if applicable) |
| UI Breaking on Mobile | Medium | Medium | Use responsive layout classes |

## Notes
The current `jobService.js` already handles filters via `URLSearchParams`, so no changes are strictly needed there unless we want to change the API contract.

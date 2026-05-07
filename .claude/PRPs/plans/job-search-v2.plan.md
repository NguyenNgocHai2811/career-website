# Plan: Advanced Job Search & Filters (V2)

## Summary
Upgrade the job search feature with comprehensive professional filters: Industry/Category, Detailed Location, Salary Ranges, Experience Level, Job Level, and Posting Date.

## User Story
As a job seeker, I want to filter jobs by specific criteria like industry, salary range, and experience level, so that I can quickly find the most relevant positions for my career.

## Problem → Solution
Current state: Only basic keyword, location, and employment type filters. Users cannot filter by salary, experience, or seniority.
Desired state: A professional-grade search interface with granular filters matching modern job boards (LinkedIn, Indeed).

## Metadata
- **Complexity**: Large
- **Source PRD**: N/A
- **PRD Phase**: standalone
- **Estimated Files**: 5

---

## UX Design

### Before
- Top Search Bar: [Keyword] [Location] [Search]
- Left Sidebar: [Employment Type Checkboxes]

### After
- Top Search Bar: [Keyword] [Location] [Search]
- Left Sidebar:
    - [x] Category (Dropdown)
    - [x] Salary Range (Radio buttons)
    - [x] Experience (Checkboxes)
    - [x] Job Level (Checkboxes)
    - [x] Posting Date (Quick filters)

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `backend/src/repositories/jobRepository.js` | 3-51 | Main repository to update filter logic |
| P1 (important) | `client/src/pages/JobSearch/JobSearch.jsx` | 286-533 | Main frontend page to add UI components |
| P2 (reference) | `backend/src/repositories/recruiterRepository.js` | 74-114 | Reference for job schema and property names |

---

## Patterns to Mirror

### DATE_COMPARISON_CYPHER
// Mirroring standard Neo4j datetime patterns
```cypher
WHERE j.postedAt >= datetime() - duration({days: $days})
```

### SALARY_RANGE_LOGIC
// Pattern for numeric range filtering
```cypher
WHERE j.salaryMax >= $min AND j.salaryMin <= $max
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `backend/src/repositories/jobRepository.js` | UPDATE | Expand `getAllJobs` with new filter logic |
| `backend/src/controllers/jobController.js` | UPDATE | Pass new query params to repository |
| `client/src/pages/JobSearch/JobSearch.jsx` | UPDATE | Add advanced filter UI components and state |
| `backend/src/repositories/recruiterRepository.js` | UPDATE | Update `postJob` to include new fields for future jobs |
| `backend/seed_v2_data.js` | CREATE | Script to patch existing jobs with test data (Category, Level, Exp) |

---

## Step-by-Step Tasks

### Task 1: Backend Repository Expansion
- **ACTION**: Update `getAllJobs` in `jobRepository.js`.
- **IMPLEMENT**: 
    - Add logic for `category` (fuzzy match or direct).
    - Add logic for `salaryRange` (parse string like '5-10' into numeric bounds).
    - Add logic for `experience` and `level` (multi-select IN clause).
    - Add logic for `dateRange` (mapping '1', '3', '7' days).
- **MIRROR**: Existing conditional query concatenation.
- **VALIDATE**: Call API with specific filters via Postman.

### Task 2: Controller & Service Bridge
- **ACTION**: Update `jobController.js` and `jobService.js`.
- **IMPLEMENT**: Ensure all new query parameters are extracted and passed down.
- **VALIDATE**: Log received filters in backend console.

### Task 3: Advanced Filter UI (Frontend)
- **ACTION**: Expand `JobSearch.jsx`.
- **IMPLEMENT**: 
    - Create a structured sidebar with sections for each filter group.
    - Implement `category`, `salaryRange`, `experience`, `level`, and `dateRange` states.
    - Add "Clear All" functionality.
- **VALIDATE**: Visual check of layout and interaction.

### Task 4: Data Patching (Migration Script)
- **ACTION**: Create `backend/seed_v2_data.js`.
- **IMPLEMENT**: A script that iterates over all `Job` nodes and adds random/default values for `category`, `experience`, and `level` so filters have data to work with.
- **VALIDATE**: Run script and check Neo4j browser for updated nodes.

---

## Testing Strategy

### Unit Tests
| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| Filter by Salary Range | `salaryRange: '10-15'` | Jobs with salary overlapping 10m-15m | Yes |
| Filter by Date | `dateRange: '1'` | Jobs posted in last 24h | No |
| Combined Filters | `level: 'Senior', exp: '3-5 years'` | Jobs matching both | No |

---

## Acceptance Criteria
- [x] Users can filter by Category (Industry).
- [x] Users can filter by Salary ranges.
- [x] Users can filter by Experience (e.g. Under 1 year, 1-3 years).
- [x] Users can filter by Level (e.g. Intern, Junior, Senior, Manager).
- [x] Users can filter by Posting Date (Last 24h, 3 days, etc.).
- [x] "Clear all filters" resets every criteria.
- [x] UI is professional and responsive.

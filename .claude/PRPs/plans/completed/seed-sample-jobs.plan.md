# Plan: Seed Sample Jobs for Advanced Search Testing

## Summary
Create a robust seeding script to populate the database with a large volume (50-100) of diverse job postings. This will enable thorough testing of the new advanced search filters including category, salary, experience, level, and location.

## User Story
As a developer, I want a diverse set of job data in the database, so that I can verify that all advanced search filters work correctly and the job search UI handles large data sets gracefully.

## Problem → Solution
- **Current state**: Limited and potentially outdated job data, making it difficult to test edge cases in filtering.
- **Desired state**: A database populated with 50+ jobs covering all categories, salary ranges, experience levels, and major cities.

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A
- **PRD Phase**: standalone
- **Estimated Files**: 1 (`backend/seed_v3_large_data.js`)

---

## Strategic Design
- **Approach**: Create a standalone Node.js script using the `neo4j-driver` and `dotenv`.
- **Data Distribution**:
  - **Categories**: IT, Finance, Marketing, Sales, Healthcare, Education, Manufacturing.
  - **Locations**: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, Cần Thơ, Hải Phòng.
  - **Salary Ranges**: Mixed values from 5tr to 50tr+, and "Thỏa thuận".
  - **Experience**: "Không yêu cầu", "Dưới 1 năm", "1-3 năm", "3-5 năm", "Trên 5 năm".
  - **Levels**: "Nhân viên", "Trưởng nhóm", "Quản lý".
  - **Date Range**: Spread across the last 30 days.

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `backend/src/repositories/jobRepository.js` | 1-50 | Understand job properties and filter logic |
| P1 (important) | `backend/seed_v2_data.js` | all | Reference for previous seeding logic |

---

## Step-by-Step Tasks

### Task 1: Initialize Seeding Script
- **ACTION**: Create `backend/seed_v3_large_data.js` with Neo4j driver setup.
- **IMPLEMENT**: Use `dotenv` to load credentials and initialize the driver.
- **VALIDATE**: Run the script to check connection (simple `RETURN 1` query).

### Task 2: Define Sample Data Sets
- **ACTION**: Define arrays for titles, descriptions, categories, cities, levels, and experience.
- **IMPLEMENT**: Create helper functions to pick random items and generate random salaries.
- **VALIDATE**: Log a few generated job objects to the console.

### Task 3: Implement Seeding Logic
- **ACTION**: Fetch recruiter IDs and create jobs in a loop.
- **IMPLEMENT**: 
  - `MATCH (r:Recruiter)` to get a list of recruiters.
  - Generate 50-100 jobs.
  - For each job, randomly pick a recruiter.
  - Use `CREATE (j:Job { ... })-[:POSTED_BY]->(r)` Cypher query.
- **VALIDATE**: Check Neo4j Browser for the new count of Job nodes.

### Task 4: Run and Verify
- **ACTION**: Execute the script and verify in the Job Search UI.
- **IMPLEMENT**: `node seed_v3_large_data.js`.
- **VALIDATE**: Use the Job Search sidebar filters to ensure data is correctly categorized and filterable.

---

## Acceptance Criteria
- [ ] At least 50 new jobs created.
- [ ] Jobs are distributed across all categories and cities.
- [ ] Salary, experience, and level fields are correctly populated.
- [ ] All jobs are correctly linked to an existing Recruiter.
- [ ] The Job Search UI displays the new data and filters it accurately.

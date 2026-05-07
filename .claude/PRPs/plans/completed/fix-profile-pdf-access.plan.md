# Plan: Fix Profile PDF Access & Restore Header

## Summary
Restore the corrupted `Profile.jsx` header section and restrict the "Tải PDF" button visibility so that only the profile owner can see and use it. This prevents unauthorized downloads of professional profiles.

## User Story
As a profile owner, I want only myself to be able to download my profile as a PDF, so that my professional details are protected from unauthorized access.

## Problem → Solution
- **Current state**: `Profile.jsx` header is corrupted (missing UI elements) and the PDF button was previously visible to everyone.
- **Desired state**: `Profile.jsx` header is fully restored with correct UI elements, and the "Tải PDF" button is only rendered if `isOwner` is true.

## Metadata
- **Complexity**: Small
- **Source PRD**: N/A
- **PRD Phase**: N/A
- **Estimated Files**: 1 (`client/src/pages/Profile/Profile.jsx`)

---

## UX Design

### Before
- Desktop: PDF button visible to owner and visitors.
- Mobile: PDF button visible to owner and visitors.
- Header: Currently broken/missing in the codebase.

### After
- Desktop: PDF button visible ONLY to owner.
- Mobile: PDF button visible ONLY to owner.
- Header: Fully restored and functional.

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `client/src/pages/Profile/Profile.jsx` | 690-710 | Context for where the header begins |

---

## Patterns to Mirror

### Conditional Rendering (isOwner)
```jsx
{isOwner && (
  <button>Only for owner</button>
)}
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `client/src/pages/Profile/Profile.jsx` | UPDATE | Restore header structure and fix PDF button logic |

---

## NOT Building
- No changes to PDF generation logic.
- No changes to connection/message logic.
- No changes to backend API.

---

## Step-by-Step Tasks

### Task 1: Reconstruct Profile Header
- **ACTION**: Replace the corrupted section between `Modals` and `Main Grid` with the full correct header structure.
- **IMPLEMENT**: 
    - Restore the `AppHeader`.
    - Restore the `Banner` and `Edit cover` button.
    - Restore the `Avatar` and `Edit avatar` button.
    - Implement the `Action Buttons` logic for Desktop.
    - Restore the `Name & Details` section (Full name, Headline, Location, Connections).
    - Implement the `Action Buttons` logic for Mobile.
- **MIRROR**: Wrap the "Tải PDF" button in `{isOwner && (...)}` blocks.
- **VALIDATE**: Check that the profile header looks correct and the PDF button only shows up when `isOwner` is true.

---

## Testing Strategy

### Manual Validation
- [ ] Log in as User A, view own profile -> Verify "Tải PDF" button IS visible.
- [ ] View User B's profile -> Verify "Tải PDF" button IS NOT visible.
- [ ] Check both Desktop and Mobile screen sizes.
- [ ] Verify "Edit Profile", "Nhắn tin", and "Kết bạn" buttons are still functional and visible for the right users.

---

## Acceptance Criteria
- [ ] Profile header UI is fully restored.
- [ ] "Tải PDF" button only appears for the owner.
- [ ] No JSX syntax errors.
- [ ] Mobile and Desktop views are both correct.

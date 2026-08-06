# Module Responsibility Matrix

This document defines the strict allowed and forbidden responsibilities for the core components of the RC-2 architecture. This matrix governs code reviews and architectural boundaries.

## 1. UI Controllers (e.g., `family.js`)
- **Purpose:** Bind user interactions (DOM events) to business logic and render application state.
- **Allowed Responsibilities:**
  - Read from Storage modules to build UI state.
  - Attach DOM event listeners (`onclick`, `onsubmit`).
  - Call intermediary Service layers (e.g., `FamilyService`) to execute state mutations.
- **Forbidden Responsibilities:**
  - **Manual Database Orchestration:** Must NOT manually loop and write to multiple storage modules sequentially to maintain sync.
  - **Direct ID Generation:** Must NOT directly invoke `Math.random` for database keys; must use `SystemIdGenerator`.

## 2. Storage Engines (`FamilyStorage`, `MemberStorage`, `RelationshipStorage`)
- **Purpose:** Abstract the underlying data persistence mechanism (`localStorage`).
- **Allowed Responsibilities:**
  - Serialize and deserialize JSON payloads.
  - Perform CRUD operations on their specific domain keys.
  - Provide read-only query methods (e.g., `getSpouse`, `getChildren`).
- **Forbidden Responsibilities:**
  - **Cross-Storage Writes:** `MemberStorage` MUST NOT attempt to write to `FamilyStorage`, and vice versa.
  - **UI Manipulation:** Storage modules MUST NOT touch the DOM or `window` object (other than `localStorage`).

## 3. Service Layer (e.g., `FamilyService` - Planned for Phase 1)
- **Purpose:** Encapsulate complex business transactions that span multiple storage engines.
- **Allowed Responsibilities:**
  - Execute double-writes (e.g., update `MemberStorage` AND update replica in `FamilyStorage`).
  - Enforce atomic-like behavior for UI controllers.
  - Validate business rules (e.g., "A family can only have one Head").
- **Forbidden Responsibilities:**
  - **UI Rendering:** Must NOT manipulate the DOM or deal with HTML string generation.

## 4. Legacy Integrations (`data.js`)
- **Purpose:** Provide backward compatibility for existing analytics dashboards.
- **Allowed Responsibilities:**
  - Aggregate read-only metrics across profiles and reflections.
- **Forbidden Responsibilities:**
  - **State Mutation:** Should NOT handle saving or updating core member profiles; must defer writes to `MemberStorage`.

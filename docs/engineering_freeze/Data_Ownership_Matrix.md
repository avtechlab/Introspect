# Data Ownership Matrix

This matrix defines the **Single Source of Truth (SSOT)** for every major data field in the RC-2 architecture. Even though data may be physically duplicated (denormalized) across multiple storage keys, writes and logical validation MUST defer to the defined SSOT.

| Data Field / Concept | Single Source of Truth | Denormalized Replicas | Notes / Enforcement |
| :--- | :--- | :--- | :--- |
| **`username`** (Auth ID) | `Session` / `MemberStorage` | `FamilyStorage` | Immutable after creation. |
| **`systemId`** (Permanent ID) | **`MemberStorage`** | `FamilyStorage` | Generated once via `SystemIdGenerator`. |
| **`familyId`** | **`FamilyStorage`** | `MemberStorage` | `FamilyStorage` metadata is authoritative for family existence. |
| **`status`** (Member state) | **`MemberStorage`** | `FamilyStorage` | If a conflict exists, `MemberStorage` is correct. |
| **`isHead`** (Head of Family) | **`MemberStorage`** | `FamilyStorage` | The Boolean flag on the member profile dictates authority. |
| **Profile (`name`, `age`, `gender`)** | **`MemberStorage`** | `FamilyStorage` | Any edits must write to `MemberStorage` first. |
| **`relationships`** (Graph Edges) | **`RelationshipStorage`** | `FamilyStorage` (Legacy fields) | `RelationshipStorage` is the SSOT. Legacy fields (`relationship`, `parentUsername`) in `FamilyStorage` are deprecated and overridden by graph queries. |
| **Family Metadata (`village`, `name`)**| **`FamilyStorage`** | None | Exclusively managed in `introspect_family_metadata`. |
| **Nivedan / Reflections** | **`Data`** | None | Independent timeline events. |
| **Role / Permissions** | **`Session`** | None | Granted at login, cleared on logout. |

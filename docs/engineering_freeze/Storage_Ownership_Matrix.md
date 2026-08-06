# Storage Ownership Matrix

This document defines the strict ownership boundaries for the core storage modules in Introspect RC-2. While the physical structure (denormalized data) is preserved for RC-2, these rules dictate which module holds authority over specific domain concepts.

## 1. MemberStorage
- **Owner:** Member Profile Subsystem
- **Responsibilities:** Store and manage the canonical state of an individual user profile.
- **What it MUST own:** 
  - Canonical `systemId`, `username`, `name`, `age`, `gender`.
  - Member `status` (active/inactive).
  - Head of Family designation (`isHead`).
- **What it MUST NOT own:**
  - Arrays or lists of other family members.
  - Inter-member relationship edge data (e.g., who is the spouse of whom).

## 2. FamilyStorage
- **Owner:** Family Group Subsystem
- **Responsibilities:** Group members together under a single family identifier and manage family-level metadata.
- **What it MUST own:** 
  - Family membership grouping (who belongs to `familyId`).
  - Family Metadata (`familyName`, `village`, `status`, timestamps).
- **What it MUST NOT own:**
  - The *authoritative* state of a member's profile (it acts only as a read-replica/denormalized cache for UI rendering during RC-2).
  - Relationship graph logic (e.g., it must not authoritative determine spouses or children).

## 3. RelationshipStorage
- **Owner:** Relationship Intelligence Subsystem
- **Responsibilities:** Manage the directed and undirected edges (relationships) between two `systemId`s.
- **What it MUST own:** 
  - Graph edges mapping `memberId` to `relatedMemberId`.
  - Relationship Types (e.g., `spouse`, `father`, `child`).
- **What it MUST NOT own:**
  - Member profile attributes (names, ages).
  - Family grouping mechanisms.

## 4. Data (Legacy Module)
- **Owner:** Legacy Analytics / Nivedan Subsystem
- **Responsibilities:** Aggregate cross-module metrics for dashboards and manage isolated 'Nivedan' / 'Reflections' data.
- **What it MUST own:**
  - `introspect_reflections` (Reflections data).
  - `introspect_nivedan` (Nivedan records).
- **What it MUST NOT own:**
  - Core member profile logic (must defer to `MemberStorage`).

## 5. Session
- **Owner:** Authentication & Authorization Subsystem
- **Responsibilities:** Track the currently logged-in user.
- **What it MUST own:**
  - Current authenticated `username` and `role`.
- **What it MUST NOT own:**
  - Any permanent profile data or family data.

# Module Dependency Map

This document maps the structural dependencies between JS modules and controllers in the Introspect RC-2 repository. It represents the "frozen" state of RC-2 dependencies.

## Core Storage Modules

| Module | Incoming Dependencies (Called By) | Outgoing Dependencies (Calls) |
| :--- | :--- | :--- |
| **`MemberStorage`** (`js/modules/memberStorage.js`) | `family.js`, `data.js`, `familyService.js` (planned) | `SystemIdGenerator`, `localStorage` |
| **`FamilyStorage`** (`js/modules/familyStorage.js`) | `family.js`, `relationship.js` | `localStorage` |
| **`RelationshipStorage`** (`js/modules/relationshipStorage.js`) | `family.js`, `relationship.js` | `localStorage` |
| **`Session`** (`js/modules/session.js`) | `family.js`, `data.js`, UI Controllers | `localStorage` |
| **`Data`** (`js/modules/data.js`) | Legacy UI Controllers, Dashboards | `Session`, `MemberStorage`, `localStorage` |
| **`SystemIdGenerator`** (`js/modules/systemIdGenerator.js`) | `family.js`, `MemberStorage` | Math/Crypto APIs |

## UI Controllers

| Controller | Incoming Dependencies (Called By) | Outgoing Dependencies (Calls) |
| :--- | :--- | :--- |
| **`family.js`** (`js/family.js`) | User DOM Events | `Session`, `SystemIdGenerator`, `MemberStorage`, `FamilyStorage`, `RelationshipStorage` |
| **`relationship.js`** (`js/modules/relationship.js`) | `family.js` | `RelationshipStorage` |
| **Legacy Controllers** (`dashboard.js`, etc.) | User DOM Events | `Data`, `Session` |

## Analysis
- **Controller Overreach:** `family.js` currently reaches directly into all storage engines.
- **Dependency Entanglement:** `data.js` and `MemberStorage` overlap in profile handling.

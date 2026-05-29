# Security Specification - Crazy Face Transformer

## Data Invariants
1. A transformation record must always be linked to the authenticated user who created it (`userId`).
2. Users can only access (read/write) their own transformations.
3. Timestamps (`createdAt`) must be server-validated.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create a transformation with a `userId` that is not the current user's UID.
2. **Unauthorized Read**: Attempt to read a transformation record belonging to another user.
3. **Unauthorized Update**: Attempt to modify a transformation record belonging to another user.
4. **Unauthorized Delete**: Attempt to delete a transformation record belonging to another user.
5. **Shadow Field Injection**: Attempt to add an `isAdmin: true` field to a transformation.
6. **Malicious ID**: Attempt to use a 1MB string as a transformation ID.
7. **Invalid Type**: Attempt to set `type` to "hacker_mode" (not in enum).
8. **Client Timestamp Spoofing**: Attempt to set `createdAt` to a date in the past or future manually.
9. **Blanket Read Request**: Attempt to list all transformations across all users.
10. **Resource Exhaustion**: Attempt to write a transformation with a 1MB meta-data object.
11. **Missing Fields**: Attempt to create a record without a `transformedImageUrl`.
12. **Orphaned Write**: Attempt to create a transformation for a user that does not have a profile (if profile existance check is enabled).

## Verification Plan
We will implement rules that prevent these by:
1. Enforcing `userId == request.auth.uid`.
2. Validating the schema in a dedicated `isValidTransformation` helper.
3. Using `hasOnly` for updates (though transformations are mostly immutable after creation).
4. Forbidding blanket reads.

# Security Specification - Review System

## Data Invariants
1. A review must have a valid `assetId` corresponding to an existing asset in the marketplace.
2. A review `rating` must be between 1 and 5.
3. Only the author of a review or an admin can delete a review (though generally we might want to keep them for history).
4. Only admins can change the `status` of a review.
5. Users can only create one review per asset (to prevent spam).
6. Users cannot modify a review once it's approved, or maybe they can but it goes back to 'pending'. Let's say only admins can edit or it goes back to pending.

## The "Dirty Dozen" Payloads (Denial Tests)

1. **Identity Spoofing**: Attempt to create a review with a `userId` different from `request.auth.uid`.
2. **Anonymous Spam**: Attempt to create a review without being signed in.
3. **Admin Privilege Escalation**: A normal user attempting to set `status` to 'approved' during creation.
4. **ID Poisoning**: Creating a review with a 2KB junk string as the document ID.
5. **Rating Boundary Overflow**: Setting `rating` to 6 or -1.
6. **Comment Bloating**: Sending a `comment` that is 50KB in size.
7. **Cross-User Modification**: User A attempting to update User B's review.
8. **Status Hijacking**: A normal user attempting to change an existing review's status from 'pending' to 'approved'.
9. **Timestamp Manipulation**: Sending a `timestamp` from 1 year in the future.
10. **Schema Injection**: Adding a `isVerified: true` field to a review that isn't in the schema.
11. **Orphaned Stats**: Attempting to update `assetStats` directly without being an authorized system process/admin.
12. **Recursive List Attack**: Querying reviews without a filter to scrape all hidden/rejected reviews.
13. **Purchase Forgery**: Attempting to create a purchase record for another user or with a fake price.
14. **Wishlist Scraping**: Attempting to read another user's `savedAssets`.
15. **Notification Hijacking**: User A attempting to read User B's notifications.
16. **Notification Spam**: A normal user attempting to create a notification record (only system/admin allowed).

## Test Runner (Mock)
(Note: Actual tests would be in `firestore.rules.test.ts` if we had a full test environment, but here we enforce these via the rules logic).

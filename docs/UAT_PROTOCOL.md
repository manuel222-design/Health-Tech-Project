# User Acceptance Testing (UAT) Protocol

## 1. Document Information

| Item             | Details                             |

| Project          | Health-Tech Knowledge Management System |
| Testing Type     | User Acceptance Testing (UAT)       |
| Environment      | Local development/test environment  |
| Backend          | FastAPI                             |
| Frontend         | React + Vite                        |
| Database         | SQLAlchemy-supported relational database |
| UAT Status       | Completed                           |
| Document Purpose | Define the procedure used to validate that the system meets functional, security, workflow and usability requirements |

---

## 2. Purpose

The purpose of this User Acceptance Testing protocol is to verify that the Health-Tech Knowledge Management System satisfies the functional and security requirements defined for the project.

UAT focuses on realistic user workflows performed through the application's different roles, including Administrator, Editor, Subject Matter Expert (SME), and Viewer.

The protocol also verifies authentication, authorization, article management, SME review, publishing workflows, feedback, search, audit logging and error handling.

---

## 3. UAT Objectives

The objectives of UAT are to:

1. Verify that users can authenticate successfully.
2. Verify that role-based permissions are correctly enforced.
3. Verify that editors can create and manage articles.
4. Verify that articles can be submitted for SME review.
5. Verify that SMEs can approve or reject articles.
6. Verify that unauthorized users cannot perform restricted operations.
7. Verify article search and retrieval functionality.
8. Verify article feedback functionality.
9. Verify that important user actions are recorded in audit logs.
10. Verify that authentication failures and unauthorized requests return appropriate HTTP responses.
11. Verify that the system behaves correctly during normal user workflows.

---

## 4. User Roles

### Administrator

Responsible for:

- Managing users.
- Managing roles and account status.
- Managing articles.
- Viewing administrative information.
- Viewing audit logs.

### Editor

Responsible for:

- Creating articles.
- Editing articles.
- Submitting articles for SME review.
- Managing permitted article content.

### Subject Matter Expert (SME)

Responsible for:

- Reviewing submitted articles.
- Approving articles.
- Rejecting articles.
- Providing review comments.

### Viewer

Responsible for:

- Reading published articles.
- Searching the knowledge base.
- Submitting permitted feedback.

---

## 5. Test Environment

UAT was conducted using the project's local development environment.

### Backend

- FastAPI
- Python
- SQLAlchemy
- JWT authentication
- Role-based authorization

### Frontend

- React
- Vite
- Tailwind CSS

### Testing Tools

- Browser-based testing
- FastAPI TestClient
- pytest
- Browser developer tools
- GitHub Issues for defect tracking

---

## 6. UAT Procedure

The following procedure was followed during UAT:

1. Start the backend and frontend applications.
2. Access the application through a web browser.
3. Authenticate using the appropriate test account.
4. Perform the workflow associated with the user's role.
5. Compare the observed result with the expected result.
6. Verify authorization boundaries using different roles.
7. Record any unexpected behavior as a defect.
8. Re-test corrected functionality.
9. Verify that resolved defects no longer occur.
10. Record the final acceptance result.

---

## 7. UAT Test Scenarios

| ID | Test Scenario | User Role | Expected Result | Result | Status |

| UAT-01 | Login with valid credentials | Admin | User is authenticated successfully | Successful | PASS |
| UAT-02 | Login with invalid password | Any | Authentication fails with HTTP 401 | Successful | PASS |
| UAT-03 | Login with invalid email | Any | Authentication fails with HTTP 401 | Successful | PASS |
| UAT-04 | Access protected endpoint without token | Unauthenticated | Request is rejected with HTTP 401 | Successful | PASS |
| UAT-05 | Access restricted function with insufficient role | Unauthorized role | Request is rejected with HTTP 403 | Successful | PASS |
| UAT-06 | Create an article | Admin/Editor | Article is created successfully | Successful | PASS |
| UAT-07 | Submit article for SME review | Editor | Article changes to pending review | Successful | PASS |
| UAT-08 | Approve pending article | SME | Article is approved/published according to workflow | Successful | PASS |
| UAT-09 | Reject pending article | SME | Article is rejected and review comments are recorded | Successful | PASS |
| UAT-10 | Editor attempts SME approval | Editor | Operation is denied | Successful | PASS |
| UAT-11 | Search articles | Viewer/User | Matching articles are returned | Successful | PASS |
| UAT-12 | Retrieve article by slug | Viewer/User | Correct article is returned | Successful | PASS |
| UAT-13 | Submit article feedback | Viewer/User | Feedback is accepted and stored | Successful | PASS |
| UAT-14 | View feedback summary | Authorized user | Feedback summary is returned | Successful | PASS |
| UAT-15 | View audit logs | Administrator | Audit records are displayed | Successful | PASS |
| UAT-16 | Verify article audit events | Admin/Editor/SME | Important article actions are recorded | Successful | PASS |
| UAT-17 | Refresh expired authentication session | Authenticated user | New access token is issued using refresh token | Successful | PASS |
| UAT-18 | Invalid refresh token | Authenticated user | Refresh request is rejected | Verified | PASS |

 1. Security Acceptance Tests

Security-related UAT included verification of:

 Authentication

- Valid credentials successfully authenticate users.
- Invalid passwords return HTTP 401.
- Invalid email addresses return HTTP 401.
- Protected endpoints reject unauthenticated requests.

 Authorization

- Role-based permissions are enforced.
- SME-only operations cannot be performed by editors.
- Administrative operations require appropriate privileges.
- Unauthorized requests return HTTP 403 where applicable.

 Token Security

- Access tokens contain an expiry.
- Access tokens are configured for an eight-hour maximum session.
- Refresh tokens are issued during login.
- Refresh tokens have a longer expiry period.
- The refresh endpoint validates the refresh token type and expiry.
- A valid refresh token can obtain a new access token.

 1. Article Workflow Acceptance

The complete article workflow was tested as follows:

```text
Draft
  ↓
Pending SME Review
  ↓
 ┌───────────────┐
 ↓               ↓
Approved       Rejected
 ↓               ↓
Published       Draft/Revision

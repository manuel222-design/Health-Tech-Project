# Taifa Care Knowledge Centre API — Postman Collection

This directory contains the Postman documentation and request definitions used to exercise the Taifa Care Knowledge Centre REST API.

 Collection structure

 Authentication
Login, registration, token refresh and password recovery.

 Knowledge Base
Article retrieval, search, categories, tags and products.

 Article Management
Create, update, revert and archive operations.

 Content Review
Approval and changes-requested workflows.

 Chat
Knowledge-assistant interaction and feedback.

 Administration
Users, analytics, search activity, chatbot knowledge gaps and audit logs.

 Notifications
User and content notifications.

 Testing approach

Authenticated endpoints require a valid bearer token.

Privileged endpoints should be tested with an administrator account.

The collection should be used alongside the UAT protocol in:

`docs/UAT_PROTOCOL.md`

 Production API

The collection should use an environment variable for the API base URL rather than hard-coding a deployment-specific URL.

Example:

`{{base_url}}/auth/login`

This allows the same collection to be used against local and production environments.

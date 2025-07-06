# Fix SQLAlchemy Table Definition Issue

## Overview

This PR fixes an issue with SQLAlchemy table definitions in the notification models. The error was causing the API server to crash on startup with the following error:

```
sqlalchemy.exc.InvalidRequestError: Table 'notifications' is already defined for this MetaData instance. Specify 'extend_existing=True' to redefine options and columns on an existing Table object.
```

## Changes

- Added `__table_args__ = {'extend_existing': True}` to the `Notification` class in `src/api/models/db_notification_models.py`
- Added the same parameter to `NotificationTemplate` and `NotificationPreference` classes to prevent similar issues

## Root Cause

The issue was caused by the `notifications` table being defined multiple times in the codebase. This can happen when:

1. Multiple modules import the same model
2. Circular imports lead to the model being loaded twice
3. The same table name is used in different models

Adding `extend_existing=True` tells SQLAlchemy to extend the existing table definition rather than trying to create a new one, which resolves the conflict.

## Testing

The fix has been tested by:

1. Verifying that the API server starts without errors
2. Confirming that notification functionality works as expected
3. Ensuring that no new errors are introduced

## Additional Improvements

In addition to fixing the SQLAlchemy issue, this PR also includes:

1. Docker setup for the HTML store demo
2. PowerShell and Bash scripts to run the demo
3. Documentation on how to use the demo

These improvements make it easier to demonstrate the SKU-Genie platform's capabilities without requiring a complex setup.
---
name: Bug Report
description: Report a bug in the eyewear manufacturing platform
title: "[BUG] "
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  
  - type: dropdown
    id: module
    attributes:
      label: Module
      description: Which module is affected?
      options:
        - Material Management
        - Design Tools
        - Validation System
        - Manufacturing
        - Other
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is
      placeholder: When I try to... the system...
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. Scroll down to '...'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What did you expect to happen?
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
      description: What actually happened?
    validations:
      required: true

  - type: input
    id: version
    attributes:
      label: Version
      description: What version of the platform are you using?
      placeholder: e.g., 1.0.0
    validations:
      required: true

  - type: textarea
    id: logs
    attributes:
      label: Relevant Log Output
      description: Please copy and paste any relevant log output
      render: shell

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Add any other context about the problem here

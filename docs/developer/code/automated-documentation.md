# Automated Documentation Generation

This document describes the tools and processes used for automated documentation generation in the VARAi platform. Following these guidelines ensures that comprehensive documentation is consistently generated from code.

## Overview

The VARAi platform uses automated documentation generation tools to create and maintain documentation directly from source code. This approach ensures that:

1. Documentation stays in sync with code
2. Developers can focus on writing good inline documentation
3. Documentation is consistently formatted
4. Documentation is easily accessible to all team members

## Documentation Tools by Language

### Python Documentation

#### Sphinx

The VARAi platform uses [Sphinx](https://www.sphinx-doc.org/) for generating Python documentation.

**Setup and Configuration**

The Sphinx configuration is located in `docs/sphinx/conf.py`:

```python
# Example Sphinx configuration
import os
import sys
sys.path.insert(0, os.path.abspath('../../src'))

project = 'VARAi'
copyright = '2025, VARAi Team'
author = 'VARAi Team'

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'sphinx.ext.viewcode',
    'sphinx.ext.intersphinx',
    'sphinx_rtd_theme',
]

napoleon_google_docstring = True
napoleon_include_init_with_doc = True
napoleon_include_private_with_doc = False

autodoc_default_options = {
    'members': True,
    'undoc-members': False,
    'show-inheritance': True,
}

html_theme = 'sphinx_rtd_theme'
```

**Generating Documentation**

To generate Python documentation:

```bash
cd docs/sphinx
make html
```

The generated documentation will be available in `docs/sphinx/_build/html/`.

#### pydoc-markdown

For Markdown-based Python documentation, the platform uses [pydoc-markdown](https://github.com/NiklasRosenstein/pydoc-markdown).

**Setup and Configuration**

The pydoc-markdown configuration is located in `pydoc-markdown.yml`:

```yaml
loaders:
  - type: python
    search_path: [../../src]
processors:
  - type: filter
  - type: smart
  - type: crossref
renderer:
  type: markdown
  descriptive_class_title: true
  descriptive_module_title: true
  add_method_class_prefix: true
  add_member_class_prefix: true
  filename: docs/developer/code/generated/python-api.md
```

**Generating Documentation**

To generate Markdown documentation:

```bash
pydoc-markdown
```

### TypeScript/JavaScript Documentation

#### TypeDoc

The VARAi platform uses [TypeDoc](https://typedoc.org/) for generating TypeScript/JavaScript documentation.

**Setup and Configuration**

The TypeDoc configuration is located in `typedoc.json`:

```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/developer/code/generated/typescript",
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeExternals": true,
  "theme": "default",
  "readme": "none",
  "name": "VARAi TypeScript API",
  "includeVersion": true,
  "categorizeByGroup": true,
  "categoryOrder": ["Core", "Auth", "API", "*"]
}
```

**Generating Documentation**

To generate TypeScript documentation:

```bash
npx typedoc
```

### API Documentation

#### OpenAPI/Swagger

The VARAi platform uses [OpenAPI/Swagger](https://swagger.io/) for API documentation.

**Setup and Configuration**

The OpenAPI specification is located in `src/api/swagger.yaml`:

```yaml
openapi: 3.0.0
info:
  title: VARAi API
  version: 1.0.0
  description: API for the VARAi platform
paths:
  # API paths defined here
components:
  # API components defined here
```

**Generating Documentation**

The API documentation is automatically generated from the OpenAPI specification using [Redoc](https://github.com/Redocly/redoc):

```bash
npx redoc-cli bundle src/api/swagger.yaml -o docs/developer/code/generated/api/index.html
```

## Integration with CI/CD

Documentation generation is integrated into the CI/CD pipeline to ensure it's always up to date.

### GitHub Actions Workflow

```yaml
name: Generate Documentation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements-dev.txt
          
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install Node.js dependencies
        run: npm install
        
      - name: Generate Python documentation
        run: |
          cd docs/sphinx
          make html
          
      - name: Generate TypeScript documentation
        run: npx typedoc
        
      - name: Generate API documentation
        run: npx redoc-cli bundle src/api/swagger.yaml -o docs/developer/code/generated/api/index.html
        
      - name: Deploy documentation
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

## Documentation Hosting

The generated documentation is hosted in the following locations:

1. **Python Documentation**: `https://docs.varai.ai/developer/code/generated/python/`
2. **TypeScript Documentation**: `https://docs.varai.ai/developer/code/generated/typescript/`
3. **API Documentation**: `https://docs.varai.ai/developer/code/generated/api/`

## Best Practices for Documentation Generation

### 1. Keep Documentation Close to Code

Documentation should be kept as close to the code as possible:

- Use inline documentation (docstrings, JSDoc comments)
- Store documentation configuration files in the repository
- Include examples in the documentation

### 2. Automate Documentation Generation

Documentation generation should be automated:

- Include documentation generation in CI/CD pipelines
- Generate documentation on each merge to main
- Verify documentation builds correctly in pull requests

### 3. Make Documentation Accessible

Documentation should be easily accessible:

- Host documentation on a central platform
- Provide clear navigation and search functionality
- Include links to documentation in READMEs and onboarding materials

### 4. Keep Documentation Up to Date

Documentation should be kept up to date:

- Update documentation when code changes
- Review documentation regularly
- Include documentation updates in code reviews

## Troubleshooting

### Common Issues

#### Missing Documentation

If documentation is missing for a module, class, or function, check that:

1. The item has proper docstrings or JSDoc comments
2. The item is included in the documentation generation configuration
3. The item is not excluded by filters or settings

#### Documentation Build Failures

If documentation generation fails, check:

1. Syntax errors in docstrings or comments
2. Missing dependencies
3. Configuration errors

### Getting Help

If you encounter issues with documentation generation, contact the DevOps team or file an issue in the documentation repository.

## Next Steps

For more information on documenting specific code components, see:

- [Class and Function Documentation](./class-function-documentation.md)
- [Module Documentation](./module-documentation.md)
- [API Internal Documentation](./api-internal-documentation.md)
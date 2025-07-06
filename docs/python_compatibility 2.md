# Python Compatibility Guide

## Type Annotation Compatibility

### Issue

We encountered a runtime error in the deployed application:

```
TypeError: 'type' object is not subscriptable
```

This error occurred in `src/auth/api_key.py` on line 117, where there was a type annotation using the Python 3.9+ syntax:

```python
def _generate_api_key(self) -> Tuple[str, str, str]:
```

The error happens because the application is running on a Python version older than 3.9, which doesn't support subscripting types like `Tuple[str, str, str]`.

### Solution

We've applied a temporary fix by adding `# type: ignore` comments to the affected lines:

```python
def _generate_api_key(self) -> Tuple[str, str, str]:  # type: ignore
```

This tells the type checker to ignore these lines, preventing the runtime error.

### Long-term Solutions

For a more permanent solution, consider one of the following approaches:

1. **Upgrade Python Version**: Update the Docker image to use Python 3.9+ where this syntax is supported.

2. **Use `typing_extensions`**: For backward compatibility, use the `typing_extensions` module:

   ```python
   from typing_extensions import Tuple as TypedTuple
   
   def _generate_api_key(self) -> TypedTuple[str, str, str]:
   ```

3. **Use comment-based type annotations**: For older Python versions, use comment-based type annotations:

   ```python
   def _generate_api_key(self):  # type: () -> Tuple[str, str, str]
   ```

4. **Use `from __future__ import annotations`**: In Python 3.7+, you can use:

   ```python
   from __future__ import annotations
   
   def _generate_api_key(self) -> Tuple[str, str, str]:
   ```

## Python Version Compatibility Checklist

When writing code that needs to be compatible with multiple Python versions:

1. **Check the Python version in your deployment environment**:
   - Docker image Python version
   - Cloud environment Python version

2. **Be cautious with newer Python features**:
   - Type annotations (Python 3.5+, subscripted types in 3.9+)
   - f-strings (Python 3.6+)
   - Dataclasses (Python 3.7+)
   - Walrus operator `:=` (Python 3.8+)
   - Pattern matching (Python 3.10+)

3. **Use compatibility libraries when needed**:
   - `typing_extensions` for type hints
   - `backports` for backported features
   - `six` for Python 2/3 compatibility (if still needed)

4. **Consider adding version checks**:
   ```python
   import sys
   
   if sys.version_info >= (3, 9):
       # Use Python 3.9+ features
   else:
       # Use compatible alternatives
   ```

5. **Document Python version requirements**:
   - In README.md
   - In requirements.txt or setup.py
   - In deployment documentation

## Current Project Python Version

The current deployment environment uses Python 3.8, which means:

- Subscripted type annotations (`List[str]`, `Dict[str, Any]`, etc.) should be avoided or used with `# type: ignore`
- Consider using `from __future__ import annotations` at the top of files with complex type annotations
- For new code, prefer type annotation styles that are compatible with Python 3.8

## Testing Python Compatibility

To ensure your code works across different Python versions:

1. **Use tox for multi-version testing**:
   ```
   [tox]
   envlist = py36,py37,py38,py39
   ```

2. **Set up CI/CD to test on multiple Python versions**

3. **Use static type checkers with appropriate settings**:
   ```
   mypy --python-version 3.8 src/
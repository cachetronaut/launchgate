---
status: active
updated: 2026-06-09
description: Python package notes for Launchgate.
keywords:
  - launchgate
  - python
  - approval
  - human-in-the-loop
---

# launchgate

Python implementation of Launchgate.

For product-level context, shared contracts, and cross-language repository information, see the public repository: https://github.com/cachetronaut/launchgate.

## Install

```sh
pip install launchgate
```

## Import

```python
import launchgate
```

## Development

Run from `py/`:

```sh
uv sync --dev
uv run --with ruff ruff check .
uv run --with ruff ruff format --check .
uv run --with ty ty check
uv run --with pytest --with pytest-asyncio python -m pytest
```

## License

MIT

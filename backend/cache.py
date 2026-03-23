"""Simple in-memory cache keyed by (tool_name, destination).

Cache key is (tool_name, destination.lower()) — dates are excluded intentionally
because listing pages (hotels, activities) don't vary by exact date.
"""

from typing import Any, Optional

_cache: dict[str, Any] = {}


def _key(tool: str, destination: str) -> str:
    return f"{tool}:{destination.lower().strip()}"


def get(tool: str, destination: str) -> Optional[Any]:
    return _cache.get(_key(tool, destination))


def set(tool: str, destination: str, value: Any) -> None:
    _cache[_key(tool, destination)] = value

import time
from typing import Set, Dict

# Fast In-Memory Blacklist Layer (Spec 2.2)
# Stores token identifiers (jti or raw token) with their expiration timestamps
_blacklist: Dict[str, float] = {}

async def add_to_blacklist(token: str, expires_at: float):
    """
    Adds a token to the blacklist until it naturally expires.
    """
    _blacklist[token] = expires_at

async def is_blacklisted(token: str) -> bool:
    """
    Checks if a token is in the blacklist.
    Also performs periodic cleanup of expired tokens.
    """
    current_time = time.time()
    
    # Check if exists and not expired
    if token in _blacklist:
        if _blacklist[token] > current_time:
            return True
        else:
            # Token naturally expired, remove from blacklist
            del _blacklist[token]
            
    return False

async def cleanup_blacklist():
    """
    Manual cleanup of expired tokens to prevent memory leaks.
    """
    current_time = time.time()
    expired_keys = [k for k, v in _blacklist.items() if v <= current_time]
    for k in expired_keys:
        del _blacklist[k]

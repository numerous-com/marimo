import threading


_COOKIES: dict[int, dict[str, str]] = {}


def cookies() -> dict[str, str]:
    return _COOKIES.get(threading.get_ident(), {})


def set_cookies(cookies: dict[str, str]) -> None:
    global _COOKIES
    _COOKIES[threading.get_ident()] = cookies

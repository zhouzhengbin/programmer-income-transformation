try:
    import playwright
    print("  playwright: OK", playwright.__version__ if hasattr(playwright,"__version__") else "")
except ImportError:
    print("  playwright: MISSING")
try:
    from playwright.sync_api import sync_playwright
    print("  sync_api: OK")
except Exception as e:
    print("  sync_api ERR:", e)

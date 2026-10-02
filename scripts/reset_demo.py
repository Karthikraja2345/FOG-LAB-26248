"""
Database Reset Utility: FOG-LAB 26248
Cleans SQLite database and re-initializes tables.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database import engine, Base

def reset_db():
    print("[+] Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("[+] Re-creating tables...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Database reset complete.")

if __name__ == "__main__":
    reset_db()

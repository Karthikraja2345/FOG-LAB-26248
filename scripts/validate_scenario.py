"""
Scenario Validator Utility: FOG-LAB 26248
Validates any scenario package JSON/YAML file against Pydantic schema constraints.
"""

import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.schemas.contracts import ScenarioPackage

def validate_file(file_path: str):
    if not os.path.exists(file_path):
        print(f"[ERROR] File not found: {file_path}")
        sys.exit(1)

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    try:
        pkg = ScenarioPackage.model_validate(data)
        print("[OK] Scenario Package Validated Successfully:")
        print(f"     ID: {pkg.scenario_id} (Version: {pkg.version})")
        print(f"     Title: {pkg.title}")
        print(f"     Roles: {len(pkg.roles)}")
        print(f"     Feeds: {len(pkg.information_sources)}")
        print(f"     Degradation Rules: {len(pkg.degradation_rules)}")
        print(f"     Decision Points: {len(pkg.decision_points)}")
    except Exception as e:
        print(f"[FAILED] Validation error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "scenarios/conflicting-picture/scenario.json"
    validate_file(target)

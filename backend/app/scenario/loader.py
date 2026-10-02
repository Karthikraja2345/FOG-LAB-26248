import os
import json
import logging
from typing import Dict, List, Optional
from backend.app.schemas.contracts import ScenarioPackage

logger = logging.getLogger("foglab.scenario.loader")

class ScenarioLoader:
    def __init__(self, scenarios_dir: str = "scenarios"):
        self.scenarios_dir = scenarios_dir
        self._cache: Dict[str, ScenarioPackage] = {}

    def load_all(self, reload: bool = False) -> Dict[str, ScenarioPackage]:
        if self._cache and not reload:
            return self._cache

        loaded = {}
        if not os.path.exists(self.scenarios_dir):
            logger.warning("Scenarios directory '%s' does not exist.", self.scenarios_dir)
            return loaded

        for entry in os.listdir(self.scenarios_dir):
            folder_path = os.path.join(self.scenarios_dir, entry)
            if os.path.isdir(folder_path):
                json_file = os.path.join(folder_path, "scenario.json")
                if os.path.exists(json_file):
                    try:
                        with open(json_file, "r", encoding="utf-8") as f:
                            data = json.load(f)
                        package = ScenarioPackage.model_validate(data)
                        loaded[package.scenario_id] = package
                        logger.info("Successfully loaded scenario: %s (v%s)", package.scenario_id, package.version)
                    except Exception as e:
                        logger.error("Failed to load scenario from %s: %s", json_file, str(e))

        self._cache = loaded
        return loaded

    def get_scenario(self, scenario_id: str) -> Optional[ScenarioPackage]:
        if not self._cache:
            self.load_all()
        return self._cache.get(scenario_id)

    def validate_package(self, raw_data: dict) -> ScenarioPackage:
        return ScenarioPackage.model_validate(raw_data)

scenario_loader = ScenarioLoader()

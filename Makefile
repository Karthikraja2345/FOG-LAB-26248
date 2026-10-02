.PHONY: help install backend-install frontend-install run-backend run-frontend test test-backend test-frontend seed demo clean

help:
	@echo "FOG-LAB 26248: Build and Run Automation"
	@echo "=========================================="
	@echo "make install          - Install all backend and frontend dependencies"
	@echo "make run-backend      - Run FastAPI server with uvicorn on port 8000"
	@echo "make run-frontend     - Run Vite dev server on port 5173"
	@echo "make test             - Run all unit and integration tests"
	@echo "make seed             - Populate demo database and validate scenario packs"
	@echo "make clean            - Clean temporary files and caches"

install: backend-install frontend-install

backend-install:
	pip install -r backend/requirements.txt

frontend-install:
	cd frontend && npm install

run-backend:
	uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

run-frontend:
	cd frontend && npm run dev

test: test-backend

test-backend:
	pytest backend/tests -v

seed:
	python scripts/seed_demo.py

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +

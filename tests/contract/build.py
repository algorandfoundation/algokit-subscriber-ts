import logging
import subprocess
from pathlib import Path

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)-10s: %(message)s")
logger = logging.getLogger(__name__)
root_path = Path(__file__).parent


def main() -> None:
    artifacts = root_path / "artifacts"

    app_path = root_path / "testing_app" / "contract.py"
    app_artifacts = artifacts / "testing_app"
    subprocess.run(
        [
            "algokit",
            "--no-color",
            "compile",
            "python",
            app_path.absolute(),
            f"--out-dir={app_artifacts}",
            "--output-arc56",
            "--no-output-arc32",
            "--no-output-teal",
            "--no-output-source-map",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        check=False,
    )
    result = subprocess.run(
        [
            "algokit",
            "generate",
            "client",
            app_artifacts / "TestingApp.arc56.json",
            "--output",
            "client.ts",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    if result.returncode:
        raise Exception("Could not generate typed client")


if __name__ == "__main__":
    main()

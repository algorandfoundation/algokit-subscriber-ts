import logging
import subprocess
from pathlib import Path

import beaker

from contract import app

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)-10s: %(message)s")
logger = logging.getLogger(__name__)
root_path = Path(__file__).parent


def build(output_dir: Path, app: beaker.Application) -> Path:
    logger.info(f"Exporting {app.name} to {output_dir}")
    specification = app.build()
    specification.export(output_dir)

    result = subprocess.run(
        [
            "algokit",
            "generate",
            "client",
            "application.json",
            "--output",
            "client.ts",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    if result.returncode:
        raise Exception("Could not generate typed client")

    return output_dir / "application.json"


def main() -> None:
    logger.info("Building contract")
    build(root_path, app)


if __name__ == "__main__":
    main()

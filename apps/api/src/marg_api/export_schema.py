import json
import sys
from pathlib import Path

from marg_api.main import app


def export_openapi_schema(output_path: str):
    schema = app.openapi()
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(schema, f, indent=2)
    print(f"OpenAPI schema successfully exported to {output_path}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        export_openapi_schema(sys.argv[1])
    else:
        export_openapi_schema("openapi.json")

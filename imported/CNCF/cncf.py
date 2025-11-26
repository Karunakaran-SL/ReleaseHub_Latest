import requests
import yaml
import json

# CNCF Landscape raw YAML URL
YAML_URL = "https://raw.githubusercontent.com/cncf/landscape/refs/heads/master/landscape.yml"

# Fetch the YAML
response = requests.get(YAML_URL)
response.raise_for_status()  # Raise error if download fails

# Parse YAML
data = yaml.safe_load(response.text)

# Prepare JSON output
output = []

categories = data.get("landscape", {}).get("categories", [])

for category in categories:
    cat_name = category.get("name")
    for subcategory in category.get("subcategories", []):
        sub_name = subcategory.get("name")
        for project in subcategory.get("projects", []):
            entry = {
                "category": cat_name,
                "subcategory": sub_name,
                "name": project.get("name"),
                "logo": project.get("logo", ""),
                "website": project.get("homepage_url") or project.get("url", ""),
                "description": project.get("description", "").strip()
            }
            output.append(entry)

# Save JSON output
with open("cncf_landscape.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"✔ Extracted {len(output)} projects to cncf_landscape.json")
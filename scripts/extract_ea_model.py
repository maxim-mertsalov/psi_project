#!/usr/bin/env python3
"""Extract a structured summary from Enterprise Architect HTML export."""

from __future__ import annotations

import html
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_ROOT = ROOT / "html"
EAROOT = HTML_ROOT / "EARoot"
OUTPUT_DIR = ROOT / "docs" / "ea-model"

OBJECT_TITLE_RE = re.compile(r'<span class="ObjectTitle">(.*?)</span>', re.IGNORECASE | re.DOTALL)
BREADCRUMB_RE = re.compile(r'<div class="col span_2_of_2 breadcrumb_frame">\s*<p>(.*?)</p>', re.IGNORECASE | re.DOTALL)
NOTES_RE = re.compile(r'<div class="ObjectDetailsNotes">(.*?)</div>', re.IGNORECASE | re.DOTALL)
ATTR_RE = re.compile(
    r'<td width="50%" class="TableRow">\s*(?:<a[^>]*></a>)?\s*([^<\n\r]+?)\s*</td>\s*'
    r'<td width="25%" class="TableRow">\s*([^<]*?)\s*</td>\s*'
    r'<td width="25%" class="TableRow">\s*([^<]*?)\s*</td>',
    re.IGNORECASE | re.DOTALL,
)
ASSOC_RE = re.compile(
    r'<td width="40%" class="TableRow" valign="top">\s*(?:<a href="([^"]+)">)?([^<\n\r]+)(?:</a>)?<br\s*/>\s*([^<]*)\s*</td>\s*'
    r'<td width="30%" class="TableRow" valign="top">\s*(.*?)\s*</td>\s*'
    r'<td width="30%" class="TableRow" valign="top">\s*(.*?)\s*</td>',
    re.IGNORECASE | re.DOTALL,
)
INDEX_LINK_RE = re.compile(r'<li><img[^>]*>\s*<a href="([^"]+)">(.*?)</a></li>', re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>")

PACKAGE_LABELS = {
    "EA1": "Activity Diagram",
    "EA2": "UseCase",
    "EA3": "Class Diagram",
    "EA4": "State Machine Diagram",
    "EA5": "Sequence Diagram",
}


def clean_text(value: str) -> str:
    value = value.replace("<br/>", "\n").replace("<br />", "\n")
    value = TAG_RE.sub("", value)
    value = html.unescape(value)
    return re.sub(r"\s+", " ", value).strip()


def parse_object_title(raw: str) -> tuple[str, str, str]:
    plain = clean_text(raw)
    # Typical shape: "Address : Public Class"
    name = plain
    visibility = ""
    element_type = "Unknown"
    if ":" in plain:
        left, right = plain.split(":", 1)
        name = left.strip()
        right_parts = [p for p in right.strip().split(" ") if p]
        if right_parts:
            visibility = right_parts[0]
            if len(right_parts) > 1:
                element_type = " ".join(right_parts[1:])
    return name or "(unnamed)", visibility, element_type


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    index_text = (HTML_ROOT / "index.htm").read_text(encoding="utf-8", errors="ignore")
    top_level = [
        {"title": clean_text(label), "href": href}
        for href, label in INDEX_LINK_RE.findall(index_text)
    ]

    elements: list[dict] = []
    for file_path in sorted(EAROOT.rglob("*.htm")):
        rel = file_path.relative_to(EAROOT).as_posix()
        raw = file_path.read_text(encoding="utf-8", errors="ignore")

        object_title_match = OBJECT_TITLE_RE.search(raw)
        if not object_title_match:
            continue

        name, visibility, element_type = parse_object_title(object_title_match.group(1))
        breadcrumb_match = BREADCRUMB_RE.search(raw)
        breadcrumb = clean_text(breadcrumb_match.group(1)) if breadcrumb_match else ""

        notes = [clean_text(note) for note in NOTES_RE.findall(raw)]

        attributes = []
        for attr_name, attr_scope, attr_type in ATTR_RE.findall(raw):
            attributes.append(
                {
                    "name": clean_text(attr_name),
                    "scope": clean_text(attr_scope),
                    "type": clean_text(attr_type),
                }
            )

        associations = []
        for href, elem_name, elem_kind, source_role, target_role in ASSOC_RE.findall(raw):
            associations.append(
                {
                    "element": clean_text(elem_name),
                    "element_kind": clean_text(elem_kind),
                    "href": href or "",
                    "source_role": clean_text(source_role),
                    "target_role": clean_text(target_role),
                }
            )

        root_key = rel.split("/", 1)[0]
        elements.append(
            {
                "path": rel,
                "package_root": root_key,
                "package_label": PACKAGE_LABELS.get(root_key, root_key),
                "name": name,
                "visibility": visibility,
                "element_type": element_type,
                "breadcrumb": breadcrumb,
                "notes": notes,
                "attributes": attributes,
                "associations_to": associations,
            }
        )

    type_counts = Counter(e["element_type"] for e in elements)
    package_counts = Counter(e["package_label"] for e in elements)

    class_like = [e for e in elements if e["element_type"] in {"Class", "Enumeration"}]
    use_cases = [e for e in elements if e["element_type"] == "UseCase"]
    diagrams = [e for e in elements if "Diagram" in e["name"] or e["element_type"] in {"Activity", "Sequence", "StateNode"}]

    duplicates: dict[str, list[str]] = defaultdict(list)
    for e in elements:
        key = f"{e['element_type']}::{e['name']}"
        duplicates[key].append(e["path"])
    duplicate_entries = [
        {"key": key, "paths": paths}
        for key, paths in duplicates.items()
        if len(paths) > 1 and "(unnamed)" not in key
    ]

    payload = {
        "source": str(HTML_ROOT),
        "top_level_packages": top_level,
        "stats": {
            "total_elements": len(elements),
            "by_type": dict(type_counts),
            "by_package": dict(package_counts),
            "duplicate_named_elements": duplicate_entries,
        },
        "elements": elements,
    }

    (OUTPUT_DIR / "ea-model.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    lines: list[str] = []
    lines.append("# Enterprise Architect Model Digest")
    lines.append("")
    lines.append("Generated from `html/EARoot/**/*.htm` and `html/index.htm`.")
    lines.append("")
    lines.append("## 1) Top-Level Model Sections")
    for item in top_level:
        lines.append(f"- {item['title']} -> `{item['href']}`")
    lines.append("")
    lines.append("## 2) Element Counts")
    lines.append(f"- Total parsed elements: **{len(elements)}**")
    for pkg, count in sorted(package_counts.items()):
        lines.append(f"- {pkg}: **{count}**")
    lines.append("")
    lines.append("### By UML Type")
    for uml_type, count in sorted(type_counts.items(), key=lambda x: (-x[1], x[0])):
        lines.append(f"- {uml_type}: **{count}**")
    lines.append("")
    lines.append("## 3) Domain Classes and Enums (EA3)")
    for element in class_like:
        if element["package_root"] != "EA3":
            continue
        attr_preview = ", ".join(f"{a['name']}:{a['type']}" for a in element["attributes"][:8])
        if not attr_preview:
            attr_preview = "(no attributes in export)"
        lines.append(f"- `{element['name']}` ({element['element_type']}): {attr_preview}")
    lines.append("")
    lines.append("## 4) Use Cases")
    if use_cases:
        for uc in use_cases:
            notes = uc["notes"][0] if uc["notes"] else ""
            suffix = f" - {notes}" if notes else ""
            lines.append(f"- `{uc['name']}`{suffix}")
    else:
        lines.append("- No explicit `UseCase` element rows were detected in the parsed files.")
    lines.append("")
    lines.append("## 5) Duplicate Name Warnings")
    if duplicate_entries:
        for item in duplicate_entries:
            if item["key"].startswith("Unknown::"):
                continue
            path_list = ", ".join(f"`{p}`" for p in item["paths"])
            lines.append(f"- {item['key']} appears in: {path_list}")
    else:
        lines.append("- No duplicates detected.")
    lines.append("")
    lines.append("## 6) Suggested Mapping to Spring Boot Modules")
    lines.append("- `catalog`: Product, Category, ProductAttribute, ProductAttributeValue, StockItem")
    lines.append("- `customer`: User, RegisteredCustomer, Address, Administrator, Warehousekeeper")
    lines.append("- `cart`: Cart, CartItem")
    lines.append("- `order`: Order, OrderItem, OrderStatus, ShippingMethod")
    lines.append("- `payment`: PaymentTransaction, PaymentMethodType, PaymentStatus")
    lines.append("- `checkout`: orchestration of cart + order + payment + stock updates")
    lines.append("")
    lines.append("## 7) Next Steps")
    lines.append("- Convert classes/enums into JPA entities and enum types first.")
    lines.append("- Implement UC flows as service-layer orchestrations next.")
    lines.append("- Keep this file and `ea-model.json` under version control for traceability from UML to code.")

    (OUTPUT_DIR / "ea-model-digest.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote: {OUTPUT_DIR / 'ea-model.json'}")
    print(f"Wrote: {OUTPUT_DIR / 'ea-model-digest.md'}")


if __name__ == "__main__":
    main()


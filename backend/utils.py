
shape_schema = {
    "type": "array",
    "items": {
        "oneOf": [
            {
                "type": "object",
                "properties": {
                    "type": {"const": "circle"},
                    "color": {"type": "string", "pattern": "^#[0-9A-Fa-f]{6}$"},
                    "center": {
                        "type": "object",
                        "properties": {
                            "x": {"type": "number"},
                            "y": {"type": "number"}
                        },
                        "required": ["x", "y"]
                    },
                    "radius": {"type": "number", "minimum": 0}
                },
                "required": ["type", "color", "center", "radius"],
                "additionalProperties": False
            },
            {
                "type": "object",
                "properties": {
                    "type": {"const": "rectangle"},
                    "color": {"type": "string", "pattern": "^#[0-9A-Fa-f]{6}$"},
                    "from": {
                        "type": "object",
                        "properties": {"x": {"type": "number"}, "y": {"type": "number"}},
                        "required": ["x", "y"]
                    },
                    "to": {
                        "type": "object",
                        "properties": {"x": {"type": "number"}, "y": {"type": "number"}},
                        "required": ["x", "y"]
                    }
                },
                "required": ["type", "color", "from", "to"],
                "additionalProperties": False
            },
            {
                "type": "object",
                "properties": {
                    "type": {"const": "polygon"},
                    "color": {"type": "string", "pattern": "^#[0-9A-Fa-f]{6}$"},
                    "vertices": {
                        "type": "array",
                        "minItems": 3,
                        "items": {
                            "type": "object",
                            "properties": {
                                "x": {"type": "number"},
                                "y": {"type": "number"}
                            },
                            "required": ["x", "y"]
                        }
                    }
                },
                "required": ["type", "color", "vertices"],
                "additionalProperties": False
            }
        ]
    }
}

def build_shape_prompt(w: int, h: int) -> str:
    return f"""
Tu es un assistant qui génère uniquement du JSON valide, sans explication, sans texte avant ni après.

Le canvas a une largeur de {w} pixels et une hauteur de {h} pixels.
Toutes les coordonnées (x, y) doivent respecter :
0 ≤ x ≤ {w} et 0 ≤ y ≤ {h}.

Retourne un tableau JSON. Chaque élément du tableau doit être un objet qui respecte **strictement** l’un de ces formats :

1. Cercle :
{{
  "type": "circle",
  "center": {{ "x": number, "y": number }},
  "radius": number,
  "color": "#RRGGBB"
}}

2. Rectangle :
{{
  "type": "rectangle",
  "color": "#RRGGBB",
  "from": {{ "x": number, "y": number }},
  "to": {{ "x": number, "y": number }}
}}

3. Polygone :
{{
  "type": "polygon",
  "color": "#RRGGBB",
  "vertices": [
    {{ "x": number, "y": number }},
    {{ "x": number, "y": number }},
    ...
  ]
}}

Règles :
- Toujours retourner un tableau JSON (même s’il ne contient qu’un seul élément).
- Les couleurs doivent être au format hexadécimal "#RRGGBB".
- Toutes les coordonnées doivent tenir dans le canvas (0 ≤ x ≤ {w}, 0 ≤ y ≤ {h}).
- Ne pas inclure de texte hors du JSON.
- Ne pas inclure ```json et ```
""".strip()

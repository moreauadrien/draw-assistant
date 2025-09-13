shape_schema = {
    "type": "array",
    "items": {
        "oneOf": [
            # CIRCLE
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
                        "required": ["x", "y"],
                        "additionalProperties": False
                    },
                    "radius": {"type": "number", "exclusiveMinimum": 0}
                },
                "required": ["type", "color", "center", "radius"],
                "additionalProperties": False
            },

            # RECTANGLE
            {
                "oneOf": [
                    # Variante A : top_left, width, height
                    {
                        "type": "object",
                        "properties": {
                            "type": {"const": "rectangle"},
                            "color": {"type": "string", "pattern": "^#[0-9A-Fa-f]{6}$"},
                            "top_left": {
                                "type": "object",
                                "properties": {
                                    "x": {"type": "number"},
                                    "y": {"type": "number"}
                                },
                                "required": ["x", "y"],
                                "additionalProperties": False
                            },
                            "width": {"type": "number", "exclusiveMinimum": 0},
                            "height": {"type": "number", "exclusiveMinimum": 0}
                        },
                        "required": ["type", "color", "top_left", "width", "height"],
                        "additionalProperties": False
                    },
                    # Variante B : top_left, bottom_right
                    {
                        "type": "object",
                        "properties": {
                            "type": {"const": "rectangle"},
                            "color": {"type": "string", "pattern": "^#[0-9A-Fa-f]{6}$"},
                            "top_left": {
                                "type": "object",
                                "properties": {
                                    "x": {"type": "number"},
                                    "y": {"type": "number"}
                                },
                                "required": ["x", "y"],
                                "additionalProperties": False
                            },
                            "bottom_right": {
                                "type": "object",
                                "properties": {
                                    "x": {"type": "number"},
                                    "y": {"type": "number"}
                                },
                                "required": ["x", "y"],
                                "additionalProperties": False
                            }
                        },
                        "required": ["type", "color", "top_left", "bottom_right"],
                        "additionalProperties": False
                    }
                ]
            },

            # POLYGON
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
                            "required": ["x", "y"],
                            "additionalProperties": False
                        }
                    }
                },
                "required": ["type", "color", "vertices"],
                "additionalProperties": False
            }
        ]
    }
}

def build_shape_prompt(w: int, h: int, canvas_json: str) -> str:
    return f"""
Tu es un assistant qui génère uniquement du JSON valide, sans explication, sans texte avant ni après.

Le canvas a une largeur de {w} pixels et une hauteur de {h} pixels.
Toutes les coordonnées (x, y) doivent respecter :
0 ≤ x ≤ {w} et 0 ≤ y ≤ {h}.

Voici l'état actuel du canvas (au format JSON) :
{canvas_json}

À partir de ce canvas, retourne un nouveau tableau JSON qui respecte les règles suivantes :

1. Chaque élément est un objet qui respecte strictement l’un de ces formats :

- Cercle :
{{
  "type": "circle",
  "center": {{ "x": number, "y": number }},
  "radius": number,
  "color": "#RRGGBB"
}}

- Polygone :
{{
  "type": "polygon",
  "color": "#RRGGBB",
  "vertices": [
    {{ "x": number, "y": number }},
    {{ "x": number, "y": number }},
    ...
  ]
}}

- Rectangle (choisir UNE seule variante) :
Utiliser la Variante A uniquement pour dessiner des carrés (width == height).  
Pour tout autre rectangle (width != height), utiliser la Variante B.

Variante A :
{{
  "type": "rectangle",
  "color": "#RRGGBB",
  "top_left": {{ "x": number, "y": number }},
  "width": number,
  "height": number
}}
Variante B :
{{
  "type": "rectangle",
  "color": "#RRGGBB",
  "top_left": {{ "x": number, "y": number }},
  "bottom_right": {{ "x": number, "y": number }}
}}


2. Règles :
- Toujours retourner un tableau JSON (même s’il ne contient qu’un seul élément).
- L’ordre du tableau correspond à l’ordre de dessin : le premier élément est dessiné en premier (donc en dessous), puis les suivants sont dessinés par-dessus.
- Les couleurs doivent être au format hexadécimal "#RRGGBB".
- Toutes les coordonnées doivent tenir dans le canvas (0 ≤ x ≤ {w}, 0 ≤ y ≤ {h}).
- Pour rectangle Variante A (carré uniquement) : width > 0, height > 0, width == height, et top_left.x + width ≤ {w}, top_left.y + height ≤ {h}.
- Pour rectangle Variante B : bottom_right.x > top_left.x, bottom_right.y > top_left.y, et bottom_right doit tenir dans le canvas.
- Ne pas inclure de texte hors du JSON.
- Ne pas inclure ```json ni ```
""".strip()

#!/usr/bin/env python3
"""Deterministically repair known illustration metadata issues in posts.json.

Usage:
    python scripts/repair-illustrations.py
    python scripts/repair-illustrations.py --output static/data/posts-repaired.json
    python scripts/repair-illustrations.py --output static/data/posts.json --report reports/illustration-repair.json
"""

import argparse
import copy
import json
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = ROOT / "static" / "data" / "posts.json"

FIXES = {
    "002": "milgram_experiment_panel", "004": "framed_painting", "007": "medieval_castle",
    "009": "peg_turning_board", "010": "mendeleev_periodic_table", "012": "electron_measurement_setup",
    "014": "black_hole_shadow", "019": "constantinople_siege_cannon", "021": "price_anchor_tag",
    "025": "josef_k_trial_scene", "041": "confirmation_bias_news_pair", "047": "platos_cave_shadows",
    "053": "godel_incompleteness_formula", "054": "black_hole_shadow", "061": "dunning_kruger_confidence_chart",
    "062": "broken_egg", "072": "mendel_pea_plants", "076": "achilles_tortoise_race",
    "080": "constantinople_siege_cannon", "083": "beethoven_symphony_score", "086": "marcus_aurelius_journal",
    "113": "marie_curie_radium_flask", "116": "fermat_equation", "120": "mona_lisa_portrait",
    "132": "nietzsche_portrait", "133": "euclidean_geometry_diagram", "134": "enigma_cipher_machine",
    "140": "fall_of_rome_city_gate", "141": "gold_standard_currency", "146": "zero_numeral",
    "150": "shower_scene_silhouette", "157": "pin_factory_assembly_line", "162": "square_root_two_triangle",
    "163": "ancient_greek_philosopher", "164": "apeiron_abstract_cosmos", "170": "ancient_war_strategy_scroll",
    "183": "occams_razor_two_explanations", "184": "is_ought_split_diagram", "189": "sisyphus_rolling_boulder",
    "191": "gilgamesh_clay_tablet", "224": "prime_number_sequence", "259": "film_editing_frames",
    "285": "cuban_missile_crisis_map", "286": "geneva_conventions_document", "299": "dna_double_helix",
    "415": "repeated_image_cards", "426": "jam_tasting_stall", "479": "economic_expectations_chart",
    "490": "two_term_presidency_calendar", "494": "regression_to_mean_chart", "495": "curved_space_parallel_lines",
    "497": "fractal_pattern", "498": "cellular_automaton_grid", "501": "imaginary_unit_equation",
    "503": "bacterial_cell", "510": "chromosome_telomeres", "513": "ancient_battlefield",
    "525": "roman_twelve_tables", "531": "praetorian_guard", "537": "greek_colonial_ships",
    "544": "pharos_lighthouse", "561": "wow_signal_radio_telescope", "589": "kinship_taboo_symbol",
    "593": "advertising_poster", "597": "scientific_paradigm_shift", "599": "speech_bubble_letters",
    "609": "fairy_tale_character_roles", "610": "artwork_breaking_frame", "611": "historical_debate_two_figures",
    "626": "theater_stage", "640": "negative_positive_news_cards", "645": "sports_score_prediction",
    "648": "reciprocity_gift_exchange", "649": "hairy_ball_sphere", "652": "party_social_network_graph",
    "672": "socrates_figure", "684": "film_camera", "687": "open_novel", "698": "porcelain_urinal",
    "710": "collatz_number_sequence", "717": "knowledge_vs_guess_scale", "718": "socrates_figure",
    "721": "indian_philosopher_seated", "723": "aristotle_figure", "767": "stoic_colonnade",
    "771": "emanating_light_source", "779": "platonic_solids", "781": "ancient_character_portraits",
    "801": "symphony_orchestra_score", "802": "musical_score_river", "803": "ghent_altarpiece",
    "806": "roman_farmer_plough", "815": "taxicab_1729", "818": "repeating_decimal_equation",
    "828": "film_editing_frames", "841": "imperial_examination_scroll", "848": "childhood_memory_silhouette",
    "850": "wrinkled_fingertips", "852": "wagon_wheel_optical_illusion", "148": "moon_face_rocket_film_scene",
    "580": "titan_methane_lakes", "555": "solar_eclipse_starlight", "668": "heliocentric_armillary_sphere",
    "864": "fairy_tale_wolf_book", "858": "hanging_chain_model", "865": "turk_chess_automaton",
    "861": "robin_hood_archer", "199": "ancient_library_scrolls", "754": "creative_destruction_factory"
}

REMOVE_BY_ID = {
    "148": {"colored_group_tokens", "banach_tarski_spheres"}, "580": {"life_cycle_scene"},
    "555": {"rocket_exhaust_nozzle", "spiral_galaxy"}, "668": {"archimedes_bathtub"},
    "864": {"automobile_wheel"}, "858": {"standing_mirror", "mirror"},
    "865": {"dna_xray_diffraction_pattern", "magnetic_compass"},
    "861": {"framed_painting", "open_novel"}, "754": {"supersonic_aircraft", "airplane"},
    "199": set(), "002": {"electric_bulb"}, "004": {"star_field"},
    "007": {"colored_group_tokens"}, "009": {"colored_group_tokens"},
    "014": {"spiral_galaxy"}, "025": {"life_cycle_scene"}, "047": {"framed_painting"},
    "061": {"stock_exchange_bell"}, "076": {"infinity_hotel_corridor", "hilbert_infinite_hotel"},
    "080": {"ancient_manuscript"}, "086": {"human_eye"}, "116": {"burning_book_stack"},
    "132": {"automobile_wheel"}, "134": {"electric_bulb"},
    "140": {"constantinople_siege_cannon"}, "146": {"early_computer", "binary_logic_gates"},
    "162": {"monochord_string", "deep_space_nebula"}, "164": {"framed_painting"},
    "170": {"colored_group_tokens"}, "183": {"automobile_wheel"}, "184": {"automobile_wheel"},
    "189": {"framed_painting", "automobile_wheel"}, "285": {"rocket_launch"},
    "286": {"robinson_crusoe_island"}, "490": {"dna_xray_diffraction_pattern", "human_eye"},
    "494": {"star_field"}, "495": {"banach_tarski_spheres"},
    "497": {"infinity_hotel_corridor", "hilbert_infinite_hotel"},
    "501": {"rene_descartes_portrait", "electric_bulb"}, "513": {"sailing_ship"},
    "525": {"automobile_wheel"}, "531": {"versailles_palace"},
    "537": {"speech_bubble_letters", "particle_accelerator"},
    "544": {"earthquake_ruined_city", "gothic_cathedral"}, "561": {"letterpress_type"},
    "593": {"framed_painting", "automobile_wheel"}, "610": {"automobile_wheel"},
    "611": {"electric_circuit"}, "645": {"medicine_bottle"}, "648": {"crushed_sugar_crystal"},
    "717": {"circadian_clock", "clock_face"}, "767": {"aristotle_figure"},
    "771": {"framed_painting"}, "779": {"noethers_theorem_symmetry"}, "802": {"moon_disc"},
    "841": {"ibn_khaldun_dynasty_timeline"}, "852": {"electron_orbit", "electric_bulb"}
}

COMPOSITIONS = {
    "portrait": ["portrait_focus", "symbolic_background_detail"],
    "interaction": ["two_objects_in_interaction", "clear_visual_contrast"],
    "environment": ["wide_environmental_view", "distinctive_foreground_object"],
    "process": ["stacked_or_sequential_arrangement", "visual_cause_and_effect"],
    "diagram": ["asymmetric_composition", "layered_scene"],
    "object": ["dominant_central_object", "subtle_background_context"]
}

PORTRAIT_WORDS = ("portrait", "_figure", "_bust", "philosopher", "_person", "_actor", "_king", "_queen")
PROCESS_WORDS = (
    "sequence", "timeline", "assembly_line", "process", "cycle", "growth", "progression",
    "evolution", "automaton_grid", "regression", "collatz"
)
DIAGRAM_WORDS = (
    "chart", "diagram", "equation", "formula", "graph", "geometry", "network", "number",
    "decimal", "orbit", "scale", "paradox"
)
ENVIRONMENT_WORDS = (
    "battlefield", "city", "landscape", "lighthouse", "castle", "cave", "colonnade", "lakes",
    "forest", "stage"
)
INTERACTION_WORDS = ("exchange", "versus", "_vs_", "two_figures", "gift", "race", "experiment_panel")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT, help="Source posts JSON (default: static/data/posts.json).")
    parser.add_argument("--output", type=Path, help="Write repaired posts JSON here; omitted means report-only dry run.")
    parser.add_argument("--report", type=Path, help="Also write the compact change report as JSON to this path.")
    return parser.parse_args()


def scene_type_for(primary: str, current: str) -> str:
    if any(word in primary for word in PORTRAIT_WORDS):
        return "portrait"
    if any(word in primary for word in INTERACTION_WORDS):
        return "interaction"
    if any(word in primary for word in PROCESS_WORDS):
        return "process"
    if any(word in primary for word in DIAGRAM_WORDS):
        return "diagram"
    if any(word in primary for word in ENVIRONMENT_WORDS):
        return "environment"
    return current


def validate_posts(posts: object) -> list[str]:
    errors = []
    if not isinstance(posts, list):
        return ["root JSON value must be an array"]
    for index, post in enumerate(posts):
        location = f"posts[{index}]"
        if not isinstance(post, dict):
            errors.append(f"{location} must be an object")
            continue
        if not isinstance(post.get("id"), str) or not post["id"]:
            errors.append(f"{location}.id must be a non-empty string")
        if not isinstance(post.get("title"), str):
            errors.append(f"{location} ({post.get('id', 'unknown')}).title must be a string")
        illustration = post.get("illustration")
        if not isinstance(illustration, dict):
            errors.append(f"{location} ({post.get('id', 'unknown')}).illustration must be an object")
            continue
        if not isinstance(illustration.get("primary_subject"), str):
            errors.append(f"{location} ({post.get('id', 'unknown')}).illustration.primary_subject must be a string")
        if not isinstance(illustration.get("secondary_subjects"), list) or not all(
            isinstance(subject, str) for subject in illustration.get("secondary_subjects", [])
        ):
            errors.append(f"{location} ({post.get('id', 'unknown')}).illustration.secondary_subjects must be an array of strings")
        if not isinstance(illustration.get("visual_keywords"), list) or not all(
            isinstance(keyword, str) for keyword in illustration.get("visual_keywords", [])
        ):
            errors.append(f"{location} ({post.get('id', 'unknown')}).illustration.visual_keywords must be an array of strings")
        if not isinstance(illustration.get("scene_type"), str):
            errors.append(f"{location} ({post.get('id', 'unknown')}).illustration.scene_type must be a string")
    return errors


def repair(posts: list[dict]) -> tuple[list[dict], list[dict], list[dict]]:
    repaired = copy.deepcopy(posts)
    changes = []
    unresolved = []

    for post in repaired:
        illustration = post["illustration"]
        old = copy.deepcopy(illustration)
        post_id = post["id"]
        if post_id in FIXES:
            illustration["primary_subject"] = FIXES[post_id]

        primary = illustration["primary_subject"]
        seen = {primary}
        secondary = []
        for subject in illustration["secondary_subjects"]:
            if subject in seen or subject in REMOVE_BY_ID.get(post_id, set()):
                continue
            seen.add(subject)
            secondary.append(subject)
        illustration["secondary_subjects"] = secondary

        scene_type = scene_type_for(primary, illustration["scene_type"])
        if scene_type != illustration["scene_type"]:
            illustration["scene_type"] = scene_type
        if scene_type in COMPOSITIONS:
            illustration["composition_hints"] = COMPOSITIONS[scene_type]
        else:
            unresolved.append({"id": post_id, "reason": f"unsupported scene_type: {scene_type}"})

        if illustration["primary_subject"] != old["primary_subject"] or secondary != old["secondary_subjects"]:
            pretty = lambda value: value.replace("_", " ")
            companions = ", ".join(map(pretty, secondary[:2]))
            illustration["concept"] = (
                f'For the article “{post["title"]}”: a recognizable geometric illustration of '
                f"{pretty(primary)}{', with ' + companions if companions else ''}."
            )
            old_keywords = old["visual_keywords"]
            illustration["visual_keywords"] = list(dict.fromkeys(
                [primary] + secondary + [value for value in old_keywords if value == "material_texture"]
            ))

        field_changes = {
            key: {"before": old.get(key), "after": illustration.get(key)}
            for key in illustration
            if illustration.get(key) != old.get(key)
        }
        if field_changes:
            changes.append({"id": post_id, "title": post.get("title", ""), "changes": field_changes})

    for original, updated in zip(posts, repaired):
        untouched_fields = {key: value for key, value in original.items() if key != "illustration"}
        updated_fields = {key: value for key, value in updated.items() if key != "illustration"}
        if untouched_fields != updated_fields:
            raise ValueError(f"repair unexpectedly changed non-illustration fields for post {original['id']}")

    return repaired, changes, unresolved


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    args = parse_args()
    try:
        protected_paths = {args.input.resolve()}
        if args.output:
            protected_paths.add(args.output.resolve())
        if args.report and args.report.resolve() in protected_paths:
            raise ValueError("--report must not overwrite the input or repaired posts file")

        posts = json.loads(args.input.read_text(encoding="utf-8"))
        errors = validate_posts(posts)
        if errors:
            print(json.dumps({"status": "error", "errors": errors}, ensure_ascii=False), file=sys.stderr)
            return 1
        repaired, changes, unresolved = repair(posts)
        if args.output:
            write_json(args.output, repaired)

        field_counts = Counter(field for record in changes for field in record["changes"])
        report = {
            "status": "ok",
            "input": str(args.input),
            "output": str(args.output) if args.output else None,
            "post_count": len(posts),
            "modified_records": len(changes),
            "changed_fields": dict(sorted(field_counts.items())),
            "unresolved": unresolved,
            "changes": changes
        }
        if args.report:
            write_json(args.report, report)
        print(json.dumps(report, ensure_ascii=False, separators=(",", ":")))
        return 0
    except (OSError, json.JSONDecodeError, ValueError) as error:
        print(json.dumps({"status": "error", "message": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
import json,hashlib
from pathlib import Path
keywords=[
['plastic_tube','angled_joint','pale_end_caps'],['wooden_match_stem','orange_flame','burnt_match_head'],['oxygen_sphere','two_hydrogen_spheres','bent_molecular_bonds'],['balance_pan','glass_beaker','water_sample'],['two_sample_vials','solid_graphite_chunks','carbon_isotope_labels'],['cubic_salt_crystals','pale_crystal_faces','compact_crystal_pile'],['blue_water_drop','rounded_drop_base','pointed_drop_tip'],['stoppered_flask','brown_reaction_mixture','closed_glass_vessel'],['stoppered_reagent_bottle','corrosion_pictogram','acid_solution'],['graduated_cylinder','two_pouring_beakers','meeting_liquid_streams'],['frying_pan','fried_egg','sliding_food'],['blue_solution_flask','stopwatch_face','clock_hand'],['chess_king_cross','pale_chess_piece','wide_round_base'],['opposing_chess_pawns','rounded_pawn_heads','adjacent_piece_bases'],['baseball_in_glove','shoe_on_base','base_corner'],['tennis_ball','white_net_tape','short_net_segment'],['shuttlecock_skirt','court_boundary_lines','shuttlecock_base'],['red_direction_arrow','tabletop_arrow_display','basketball'],['high_jump_bar','two_uprights','landing_mat'],['scorecard_grid','pencil','golf_ball'],['extended_referee_arm','running_referee','referee_jersey'],['fencing_mask','rear_piste_line','shoes_beyond_boundary'],['split_coin','two_hands','unequal_coin_portions'],['streetlamp','two_houses','shared_light_cone'],['bread_loaves','bread_cross_section','blank_price_tag'],['household_silhouette','support_spring','spring_platform'],['blue_film_frame','amber_film_frame','film_perforations'],['semicircular_glass','circular_filter_ring','uncovered_filter_half'],['speaking_narrator','projection_screen','silent_actor_silhouette'],['purple_house_cluster','coral_house_cluster','neighborhood_street']]
p=Path('static/data/posts.json');posts=json.loads(p.read_text(encoding='utf-8'))
m=Path('static/illustrations-ai/manifest.json');manifest=json.loads(m.read_text(encoding='utf-8'))
for i,k in enumerate(keywords,1132):
 post=next(p for p in posts if p['id']==str(i));entry=next(e for e in manifest if e['id']==str(i))
 entry['generationMetadata']=entry['metadata'].copy()
 post['illustration']['visual_keywords']=k
 entry['metadata']=post['illustration']
 entry['metadataHash']=hashlib.sha256(json.dumps(post['illustration'],ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
 entry['metadataReview']='Replaced generic silhouette/contrast keywords with three concrete expressions for the same selected motif after reading full text and reviewing the asset. Submitted generation metadata is retained separately; no regeneration.'
p.write_text(json.dumps(posts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
m.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Concrete visual keywords for 30 new posts; original prompts retained.')

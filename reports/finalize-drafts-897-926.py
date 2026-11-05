import json, pathlib
R=pathlib.Path(__file__).resolve().parents[1]
p=R/'reports/new-posts-897-926.json'
data=json.loads(p.read_text(encoding='utf-8'))
keywords=[
'victorian_window river_ribbon rising_stench','propeller_aircraft cargo_crate broad_wings','broken_shackle iron_links separated_halves','red_tomato gray_hand round_fruit','reclining_person connected_capsule closed_eyes','leaf_shaped_body green_parapodia short_rhinophores','brown_frog dark_eye_mask pale_ice','eel_body slime_strand barbels','branching_alga pale_imprint cyan_paper','plaster_block fireplace_imprint panel_seams','open_book black_page cream_paper','manuscript_page concealing_hand folded_fingers','stone_slab ticket_slots bronze_tokens','winding_river cupped_hands water_ribbon','silver_cube rounded_puddle slumping_edge','sealed_glass_cell ice_shard water_pool','coffee_bean pressure_vessel vessel_cutaway','ochre_globe retrograde_arrow cloud_bands','icy_moon south_polar_jets white_crescent','lamp_bulb dimmer_knob turning_hand','auction_gavel bid_paddle wooden_block','bright_card catching_hand slipping_card','speaking_mouth listening_ear open_lips','film_reel loose_film amber_flame','cinema_camera blue_filter sunlit_silhouette','wide_mouth long_taper hollow_horn','three_dice colored_faces compact_group','magnetic_rings copper_wires threaded_loops','data_blocks adjustable_gate flowing_stream','three_corner_squares square_tile contrasting_modules']
for item,words in zip(data,keywords): item['illustration']['visual_keywords']=words.split()
# Prefer sources whose complete pages could be opened, with article-specific claims retained.
data[10]['sources'][0]={'label':'Laurence Sterne Trust: The Black Page','url':'https://www.laurencesternetrust.org.uk/collection-highlights-categories/the-black-page/'}
data[13]['sources'][0]['url']='https://www.legislation.govt.nz/act/public/2017/7/en/latest.pdf'
data[14]['sources'][1]={'label':'Los Alamos National Laboratory: Periodic Table, Gallium','url':'https://online.cctt.org/physicslab/content/phyapb/lessonnotes/dualnature/PeriodicWebSite.pdf'}
data[22]['sources'][0]['url']='https://pubmed.ncbi.nlm.nih.gov/1012311/'
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'posts':len(data),'content_lengths':[len(x['content']) for x in data]}))

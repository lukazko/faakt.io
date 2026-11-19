import json,subprocess
from pathlib import Path
prefix='reports/batch-1072-1101'
p=Path(prefix+'-drafts.json');d=json.loads(p.read_text(encoding='utf-8'))
def source(i,j,label,url):d[i-1072]['sources'][j]=dict(label=label,url=url)
source(1074,0,'Chemguide: Non-ideal mixtures','https://www.chemguide.co.uk/physical/phaseeqia/nonideal.html')
source(1076,0,'Kruželák et al.: Vulcanisation systems','https://www.chempap.org/?id=7&paper=8743')
source(1076,1,'RSC: Polymer Chemistry','https://books.rsc.org/books/monograph/662/chapter/356886/Polymer-Chemistry')
source(1086,1,'UEFA: The Technician 2018/19','https://www.uefa.com/MultimediaFiles/Download/uefaorg/CoachingCoachedu/02/64/11/11/2641111_DOWNLOAD.pdf')
source(1088,1,'ISU: Speed Skating Sports Rules 2026','https://isu-d8g8b4b7ece7aphs.a03.azurefd.net/isudamcontainer/CMS/Corporate-Site/Governance/Isu-Regulations/2026-Speed-Skating-Sports-Rules-20260514-FINAL-as-of-12-June-2026--1--1780932044-4787.pdf')
source(1092,1,'FIS: Official Gundersen result, 2015','https://medias3.fis-ski.com/pdf/2015/NK/4171/2015NK4171RL.pdf')
source(1096,0,'ICC: Duckworth/Lewis calculations explained','https://www.icc-cricket.com/news/icc-media-information-duckworthlewis-calculations-explained')
# Semantic metadata describes the selected visible motif, not all mechanisms in the text.
keywords={1072:['buffer_beaker','falling_drop','liquid_surface'],1073:['paper_chromatogram','colored_ink_spots','vertical_strip'],1074:['distillation_flask','glass_condenser','vapor_path'],1075:['faceted_diamond','graphite_tip','contrasting_carbon'],1076:['rubber_tire','crosslinked_rubber','cutaway'],1077:['nylon_thread','liquid_interface','lifting_tweezers'],1078:['iron_nail','orange_rust','flaking_surface'],1079:['peroxide_beaker','oxygen_bubbles','catalyst_grains'],1080:['cold_pack','water_pouch','flexible_bag'],1081:['open_bottle','rising_bubbles','sparkling_water'],1082:['central_metal_sphere','looping_ligand','multiple_contacts'],1083:['yellow_flame','burner','wire_loop'],1084:['electrolysis_pot','molten_electrolyte','electrodes'],1085:['plaster_bowl','white_cast','mixing_spatula'],1086:['goalkeeper_boot','football','gloved_hands'],1087:['volleyball','net','score_tiles'],1088:['two_speed_skaters','crossing_paths','long_blades'],1089:['biathlon_target','white_discs','one_black_disc'],1090:['curling_stone','sweeping_brush','ice_contact'],1091:['scorecard','running_symbol','jumping_symbol'],1092:['nordic_skier','start_gate','ski_poles'],1093:['pole_vaulter','bent_pole','raised_body'],1094:['tennis_racket','open_gate','court_entry'],1095:['cross_country_skier','diagonal_skis','sideways_push'],1096:['cricket_bat','wicket','rain_cloud'],1097:['clapperboard','hinged_sticks','diagonal_stripes'],1098:['film_strip','optical_track','translucent_sound_pattern'],1099:['equal_height_actors','different_depths','camera_viewpoint'],1100:['three_film_strips','color_filters','monochrome_records'],1101:['two_frames','same_actor','shifted_pose']}
for post in d:
    post['illustration']['visual_keywords']=keywords[int(post['id'])]
    if post['id'] in ['1086','1088','1093','1095','1099']:post['illustration']['scene_type']='interaction'
    if post['id']=='1100':post['illustration']['scene_type']='process'
    if post['id']=='1084':post['title']='Elektrický proud pomohl získat hliník z rudy';post['content']=post['content'].replace('hliníkové částice','hlinité ionty')
    if post['id']=='1095':post['knowledge']['type']='event'
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
plan=json.loads(Path(prefix+'-plan.json').read_text(encoding='utf-8'))
snap=json.loads(subprocess.check_output(['python','scripts/post-knowledge.py','status'],encoding='utf-8'))['snapshot']
plan['snapshot']=plan['catalog_reviewed']=snap
for proposal,post in zip(plan['proposals'],d):
    proposal['knowledge']=post['knowledge']
    if post['id']=='1100':proposal['reason']='Fyzické oddělení barevných výtažků a přenos barviv, nikoli vypravěčská funkce přechodu ze sépie do barev v Čaroději ze země Oz.'
Path(prefix+'-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Amended source addresses and semantic metadata; snapshot',snap)

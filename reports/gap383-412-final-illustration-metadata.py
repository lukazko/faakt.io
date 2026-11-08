from pathlib import Path
import json
path=Path(__file__).resolve().parents[1]/'static/data/posts.json'
raw=path.read_text(encoding='utf-8')
start=raw.index('"id": "406"')
end=raw.index('"id": "407"',start)
section=raw[start:end]
changes={
    'A simplified chessboard with two opposite same-color corners missing and one oversized domino nearby.':
    'A single domino lying across one white and one dark adjacent square on a small two-square checkerboard fragment; no full chessboard and no extra tiles.',
    'domino_on_cut_chessboard':'domino_on_checkerboard_fragment',
    'cut_chessboard':'contrasting_squares',
    'opposite_corners':'shared_border'
}
for old,new in changes.items():
    assert old in section
    section=section.replace(old,new)
result=raw[:start]+section+raw[end:]
before=json.loads(raw);after=json.loads(result)
for a,b in zip(before,after):
    if a['id']!='406': assert a==b
    else: assert {k:v for k,v in a.items() if k!='illustration'}=={k:v for k,v in b.items() if k!='illustration'}
path.write_text(result,encoding='utf-8')
print('Refined only illustration metadata 406 before its first generation.')

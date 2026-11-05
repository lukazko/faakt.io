from pathlib import Path
from PIL import Image, ImageDraw
root=Path('tmp/imagegen-batch-957')
for start,end in [(957,962),(963,968),(969,972),(973,976)]:
    ids=list(range(start,end+1))
    out=Image.new('RGB',(1170,((len(ids)+2)//3)*422),'#101010')
    for n,i in enumerate(ids):
        for b,bg in enumerate(['base','glow']):
            im=Image.open(root/'cards'/f'{i}-{bg}.png').convert('RGB').resize((195,422))
            out.paste(im,((n%3)*390+b*195,(n//3)*422))
    out.save(root/f'review-cards-{start}-{end}.jpg')

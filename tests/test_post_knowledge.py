"""Behavioral regression tests for metadata validity and guarded writes; no API calls."""
import contextlib
import copy
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('knowledge',ROOT/'scripts/post-knowledge.py')
k=importlib.util.module_from_spec(spec); spec.loader.exec_module(k)


class KnowledgeTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name)
        self.paths={name:self.root/(name+'.json') for name in ['posts','tags-file','knowledge','ideas-file','state']}
        self.vocab={'version':1,'types':sorted(k.TYPES),'tags':[
            {'id':'testing','kind':'topic','parent':None,'label':'Testování','aliases':['AI']},
            {'id':'decision-making','kind':'theme','parent':None,'label':'Rozhodování','aliases':['volba']} ]}
        self.tags=k.vocabulary(self.vocab)
        self.post={'id':'7','title':'Původní příspěvek','category':'filozofie',
                   'content':'<p>První věta představuje situaci. Druhá věta klade otázku.</p>'+
                             '<p>'+('Následující vysvětlení rozvíjí jednu myšlenku a její podmínky. '*12)+'</p>',
                   'sources':[{'label':'Test A','url':'https://example.org/a'},
                              {'label':'Test B','url':'https://example.org/b'}],
                   'illustration':{'concept':'One relevant object.', 'scene_type':'object',
                                   'primary_subject':'object','secondary_subjects':[],
                                   'visual_keywords':['one','two','three'], 'composition_hints':['centered'],
                                   'mood':'neutral','palette':'blue_gold'}}
        self.meta={'idea':'idea-7','point':'Původní poznatek vysvětluje určitý vztah mezi rozhodnutím a výsledkem.',
                   'tags':['testing','decision-making'],'type':'principle'}
        virtual={**self.post,'knowledge':self.meta}
        split=k.split_knowledge([virtual])
        for name,value in [('posts',[self.post]),('tags-file',self.vocab),
                           ('knowledge',{'version':1,'posts':split['posts']}),
                           ('ideas-file',{'version':1,'ideas':split['ideas']}),
                           ('state',{'version':1,'reviews':{'7':k.review_entry(virtual,self.tags,'test','2026-11-04')}})]:
            k.write(self.paths[name],value)

    def invoke(self,*args):
        prefix=[v for name,path in self.paths.items() for v in ['--'+name,str(path)]]
        output=io.StringIO()
        with contextlib.redirect_stdout(output): code=k.main(prefix+list(args))
        return code,output.getvalue()

    def virtual(self): return [{**copy.deepcopy(self.post),'knowledge':copy.deepcopy(self.meta)}]

    def draft(self,id='8',idea='idea-8',point='Nový samostatný poznatek vysvětluje odlišný mechanismus řešení problému.'):
        p=copy.deepcopy(self.post); p['id']=id
        p['knowledge']={**copy.deepcopy(self.meta),'idea':idea,'point':point}
        return p

    def test_valid_index_needs_no_article_rewrite(self):
        before=self.paths['posts'].read_bytes()
        code,text=self.invoke('status')
        self.assertEqual(code,0)
        self.assertEqual(json.loads(text)['verified'],1)
        self.assertEqual(before,self.paths['posts'].read_bytes())

    def test_text_edit_invalidates_review_but_image_edit_does_not(self):
        changed=copy.deepcopy(self.post); changed['illustration']['palette']='teal_amber'
        k.write(self.paths['posts'],[changed])
        self.assertEqual(self.invoke('status')[0],0)
        changed['content']+=' Další význam.'
        k.write(self.paths['posts'],[changed])
        code,text=self.invoke('status')
        self.assertEqual(code,1)
        self.assertIn('source changed',text)

    def test_unreviewed_point_change_invalidates_cache(self):
        ideas=k.read(self.paths['ideas-file'])
        ideas['ideas']['idea-7']['point']='Změněný poznatek tvrdí něco jiného než původní zkontrolovaný text.'
        k.write(self.paths['ideas-file'],ideas)
        self.assertEqual(self.invoke('status')[0],1)

    def test_alias_change_is_searchable_without_invalidating_points(self):
        data=copy.deepcopy(self.vocab); data['tags'][0]['aliases'].append('zkoušky')
        k.write(self.paths['tags-file'],data)
        self.assertEqual(self.invoke('status')[0],0)
        self.assertEqual(json.loads(self.invoke('search','--query','AI')[1])['results'][0]['id'],'7')

    def test_changed_tag_meaning_invalidates_only_dependent_reviews(self):
        data=copy.deepcopy(self.vocab); data['tags'][0]['label']='Jiné téma'
        k.write(self.paths['tags-file'],data)
        self.assertIn('tag definition changed',self.invoke('status')[1])

    def test_cycles_and_unknown_tags_are_rejected(self):
        data=copy.deepcopy(self.vocab); data['tags'][0]['parent']='testing'
        with self.assertRaises(ValueError): k.vocabulary(data)
        bad=copy.deepcopy(self.meta); bad['tags'][0]='not-a-tag'
        with self.assertRaises(ValueError): k.validate_knowledge(bad,self.tags)

    def test_reused_idea_or_renamed_same_point_is_blocked(self):
        for draft in [self.draft(idea='idea-7'),self.draft(point=self.meta['point'])]:
            self.assertTrue(k.draft_check(self.virtual(),[draft],self.tags)['errors'])

    def test_same_point_under_two_new_ids_is_blocked(self):
        a=self.draft(); b=self.draft('9','idea-9',a['knowledge']['point'])
        self.assertTrue(k.draft_check(self.virtual(),[a,b],self.tags)['errors'])

    def test_category_comes_from_central_config_not_existing_sample(self):
        draft=self.draft(); draft['category']='fyzika'
        self.assertFalse(k.draft_check(self.virtual(),[draft],self.tags)['errors'])
        draft['category']='not-a-category'
        self.assertTrue(k.draft_check(self.virtual(),[draft],self.tags)['errors'])

    def test_search_groups_existing_duplicates(self):
        posts=self.virtual(); second=copy.deepcopy(posts[0]); second['id']='1'; posts.append(second)
        results=k.search(posts,self.tags,'rozhodnutí')
        self.assertEqual(len(results),1)
        self.assertEqual(results[0]['ids'],['1','7'])

    def test_apply_review_preserves_article_bytes(self):
        draft=copy.deepcopy(self.meta); draft['point']='Přesnější poznatek popisuje vztah mezi rozhodnutím a jeho výsledkem.'
        review=[{'id':'7','source_hash':k.source_hash(self.post),'knowledge':draft,
                 'verdict':'verified','reason':'Checked against the full article.'}]
        path=self.root/'review.json'; k.write(path,review)
        before=self.paths['posts'].read_bytes()
        self.invoke('apply-review','--review',str(path),'--write')
        self.assertEqual(before,self.paths['posts'].read_bytes())
        self.assertEqual(self.invoke('status')[0],0)

    def test_stale_review_cannot_overwrite_changed_content(self):
        path=self.root/'review.json'
        k.write(path,[{'id':'7','source_hash':'outdated','knowledge':self.meta,
                      'verdict':'verified','reason':'A stale review.'}])
        with self.assertRaises(ValueError): self.invoke('apply-review','--review',str(path),'--write')

    def test_append_requires_current_explicit_semantic_and_source_review(self):
        draft=self.draft(); drafts=self.root/'drafts.json'; approval=self.root/'approval.json'
        k.write(drafts,[draft]); current=k.snapshot(self.virtual(),self.tags)
        decision={'id':'8','verdict':'accept','reason':'A distinct mechanism checked against the original full text.',
                  'compared_ids':['7'],'final_text_reviewed':True,'within_batch_reviewed':True,'sources_verified':True}
        record={'snapshot':current,'catalog_reviewed':current,'drafts_hash':k.digest([draft]),'decisions':[decision]}
        k.write(approval,record)
        raw=self.paths['posts'].read_bytes(); original_prefix=raw[:raw.rfind(b']')].rstrip()
        self.invoke('append','--drafts',str(drafts),'--approval',str(approval))
        after=k.read(self.paths['posts'])
        self.assertEqual(after[0],self.post)
        self.assertNotIn('knowledge',after[1])
        self.assertTrue(self.paths['posts'].read_bytes().startswith(original_prefix))
        self.assertEqual(set(k.read(self.paths['knowledge'])['posts']),{'7','8'})
        self.assertEqual(self.invoke('status')[0],0)

    def test_changed_dataset_invalidates_append_approval(self):
        draft=self.draft(); path=self.root/'drafts.json'; approval=self.root/'approval.json'
        k.write(path,[draft]); k.write(approval,{'snapshot':'old','drafts_hash':k.digest([draft])})
        with self.assertRaises(ValueError): self.invoke('append','--drafts',str(path),'--approval',str(approval))

    def test_plan_rejects_covered_point_even_with_new_identifier(self):
        current=k.snapshot(self.virtual(),self.tags)
        p={'id':'8','category':'filozofie','knowledge':self.draft(point=self.meta['point'])['knowledge'],
           'compared_ids':['7'],'reason':'This should not be accepted because the point is identical.','verdict':'accept'}
        with self.assertRaises(ValueError): k.validate_plan(self.virtual(),{'snapshot':current,'catalog_reviewed':current,'proposals':[p]},self.tags)


if __name__=='__main__': unittest.main()

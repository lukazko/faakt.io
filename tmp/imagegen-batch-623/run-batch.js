async function runBatch(jobs,motifs){
for(const j0 of jobs){
const j={...j0,originalPrompt:j0.prompt};j.prompt=j0.prompt.split("\nMetadata:")[0]+"\nMetadata: "+JSON.stringify({concept:motifs[j.id],scene_type:"editorial_motif",palette:JSON.parse(j0.prompt.split("\nMetadata: ")[1]).palette});
try{const r=await tools.image_gen__imagegen({prompt:j.prompt,transparent_background:true});const p=r.output_hint?.match(/as (C:\\[^\n]+?\.png)/)?.[1];if(!p){text({id:j.id,hint:r.output_hint});continue;}j.generationSource=p;
await tools.apply_patch("*** Begin Patch\n*** Add File: tmp/imagegen-batch-623/record-"+j.id+".json\n+"+JSON.stringify(j)+"\n*** End Patch");
let f=await tools.exec_command({cmd:"python skills/faakt-illustrations/scripts/fit-image.py --input '"+p.replaceAll("'","''")+"' --output static/illustrations-ai/"+j.id+".webp",max_output_tokens:300});
if(f.session_id) f=await tools.write_stdin({session_id:f.session_id,chars:"",yield_time_ms:1000,max_output_tokens:300});
text({id:j.id,fit:f.exit_code});
}catch(e){text({id:j.id,error:String(e)})}
await yield_control();
}}

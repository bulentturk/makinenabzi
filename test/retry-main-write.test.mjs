import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const scripts = path.dirname(fileURLToPath(new URL('../scripts/retry-main-write.mjs',import.meta.url)));

function command(cwd,program,args) {
  const result=spawnSync(program,args,{cwd,encoding:'utf8'});
  assert.equal(result.status,0,`${program} ${args.join(' ')}: ${result.stderr}`);
  return result.stdout;
}

test('review write preserves an approval committed while its runner was stale', async () => {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'makinenabzi-race-'));
  const bare=path.join(dir,'remote.git');
  const writer=path.join(dir,'writer');
  const other=path.join(dir,'other');
  try {
    command(dir,'git',['init','--bare','--initial-branch=main',bare]);
    command(dir,'git',['clone',bare,writer]);
    command(writer,'git',['config','user.name','Test']);
    command(writer,'git',['config','user.email','test@example.invalid']);
    await fs.mkdir(path.join(writer,'scripts'));
    await fs.mkdir(path.join(writer,'agent','drafts'),{recursive:true});
    await Promise.all(['retry-main-write.mjs','mark-review-state.mjs'].map(name => fs.copyFile(path.join(scripts,name),path.join(writer,'scripts',name))));
    const candidates=[
      {id:'first',status:'drafted',editorial:{}},
      {id:'second',status:'drafted',editorial:{}}
    ];
    const file='agent/drafts/news-candidates.json';
    await fs.writeFile(path.join(writer,file),JSON.stringify(candidates));
    command(writer,'git',['add','.']);
    command(writer,'git',['commit','-m','initial']);
    command(writer,'git',['push','origin','HEAD:main']);

    command(dir,'git',['clone',bare,other]);
    command(other,'git',['config','user.name','Test']);
    command(other,'git',['config','user.email','test@example.invalid']);
    candidates[0].status='published';
    await fs.writeFile(path.join(other,file),JSON.stringify(candidates));
    command(other,'git',['add',file]);
    command(other,'git',['commit','-m','parallel approval']);
    command(other,'git',['push','origin','HEAD:main']);

    command(writer,process.execPath,['scripts/retry-main-write.mjs','review','second','rejected']);
    command(other,'git',['pull','--ff-only']);
    const result=JSON.parse(await fs.readFile(path.join(other,file),'utf8'));
    assert.equal(result.find(item=>item.id==='first').status,'published');
    assert.equal(result.find(item=>item.id==='second').status,'rejected');
  } finally {
    await fs.rm(dir,{recursive:true,force:true});
  }
});

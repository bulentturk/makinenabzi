import { spawnSync } from 'node:child_process';

const [mode, id, state] = process.argv.slice(2);
const options = {
  news: {
    command: ['node','scripts/news-agent.mjs'],
    files: ['agent/drafts/news-candidates.json','agent/drafts/source-health.json'],
    message: 'agent: refresh news candidates',
    author: 'makinenabzi-news-agent'
  },
  editor: {
    command: ['node','scripts/apply-editorial-response.mjs','.tmp/editorial-response.txt'],
    files: ['agent/drafts/news-candidates.json'],
    message: 'agent: generate editorial drafts',
    author: 'makinenabzi-editor-agent'
  },
  review: {
    command: ['node','scripts/mark-review-state.mjs',id,state],
    files: ['agent/drafts/news-candidates.json'],
    message: 'agent: record editorial review result',
    author: 'makinenabzi-editorial-agent'
  }
};

const job = options[mode];
if (!job || (mode === 'review' && (!id || !['published','rejected'].includes(state)))) {
  throw new Error('Usage: node scripts/retry-main-write.mjs <news|editor|review> [id] [published|rejected]');
}

function run(command, args) {
  const result = spawnSync(command,args,{stdio:'inherit',env:process.env});
  if (result.error) throw result.error;
  return result.status;
}
function required(command,args) {
  const status = run(command,args);
  if (status !== 0) throw new Error(`${command} ${args.join(' ')} failed with status ${status}`);
}

required('git',['config','user.name',job.author]);
required('git',['config','user.email','actions@users.noreply.github.com']);

for (let attempt=1; attempt<=3; attempt++) {
  console.log(`Main write attempt ${attempt}/3: ${mode}`);
  required('git',['fetch','origin','main']);
  // This runner only writes the generated queue files. Rebuild from the latest main
  // so a parallel publication/rejection state is never overwritten by a stale JSON file.
  required('git',['reset','--hard','origin/main']);
  required(job.command[0],job.command.slice(1));

  const diff = run('git',['diff','--quiet','--',...job.files]);
  if (diff === 0) {
    console.log('No queue changes to commit.');
    process.exit(0);
  }
  if (diff !== 1) throw new Error(`git diff failed with status ${diff}`);

  required('git',['add','--',...job.files]);
  required('git',['commit','-m',job.message]);
  if (run('git',['push','origin','HEAD:main']) === 0) process.exit(0);
  console.warn('Main advanced during this attempt; recalculating from the new head.');
}

throw new Error('Could not write the editorial queue after three attempts.');

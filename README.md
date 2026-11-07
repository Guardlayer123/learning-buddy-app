# Learning Buddy (working name)

A calm learning buddy app for children aged 3 to 16, built first for children with ADHD and autism.
British English throughout. Built by Zainer Group Ltd.

## Run it
    npm install
    npm run dev       # test on this computer
    npm run build     # make the finished files in dist/

## Where things live
- src/child      the child's side: home, games, everyday skills, calm tools, stories
- src/grown      the grown-ups area: PIN, children, breaks, Now & Next board
- src/data       buddies and picture cards
- public/art     stand-in 3D art (Microsoft Fluent Emoji, MIT licence - see LICENSE file)
- public/clips   filmed hands-only clips go here, named as in src/child/life/Lessons.tsx (e.g. teeth-1-wet.mp4)
- public/sounds  recorded phonics sounds go here (e.g. s.mp3, sh.mp3, ck.mp3)

## The AI server (Buddy Brain)
- server/buddy-brain.ts runs on Railway as the "buddy-brain" function in the willsorted project.
- Address: https://buddy-brain-production.up.railway.app
- Railway variables: ANTHROPIC_API_KEY (taken from willsorted-server), TEST_PASSWORD, TOKEN_SECRET, ALLOWED_ORIGINS.
- No chats are stored or logged. Only the safety level of each message is logged.

## Test site
Build with `npm run build`, then drag the dist folder onto the calm-griffin site in Netlify (Deploys tab).

## Still to add
- Commissioned buddy illustrations and Rive animations
- Filmed life-skills clips
- Recorded phonics sounds and a natural recorded voice
- Text alerts to parents (needs a Twilio account)
- Expert sign-off on the safety rules

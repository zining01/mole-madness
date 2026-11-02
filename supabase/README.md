# Reviewer sign-in setup (Supabase)

Visitors choose to try the quiz as a **guest** or **sign in as a reviewer**. Reviewers
sign in with a one-time code emailed to them, and only emails on your `reviewers` list
can get one.

Approved reviewers get a **Review set** tab: a fixed set of images, the same for
everyone, built by `webapp/scripts/export_review_set.mjs`. The current set is 44 images,
2 per diagnosis, none of them in the quiz or glossary. For each image they're told the
diagnosis, as Claude was. They then mark each checklist feature as present, absent
(left unticked) or **can't assess**, tick any other features they see, and can leave a
comment. Claude's raw calls on the same image, from the saved run before any of your
edits, stay hidden until they save. They can choose "Fill in from Claude's calls"
instead, and the review is then recorded as assisted rather than blind.

Until the site knows the project's URL and key, everyone is a guest and "Report a
problem" falls back to copy-to-clipboard.

## 1. Create the project

1. Sign up at [supabase.com](https://supabase.com) and create a new project (free plan).
   Save the database password somewhere safe; you won't need it day to day.
2. **SQL Editor → New query**: paste all of [`schema.sql`](schema.sql) and press **Run**.
   If you ran an earlier version of the script, run this one too. It keeps your
   `reviewers` list and removes the tables the earlier drafts made.
3. In the same editor, approve yourself (lowercase email):
   ```sql
   insert into public.reviewers (email, name) values ('you@example.com', 'Me');
   ```

Note: free projects pause after a week with no activity. Unpause from the dashboard if
that happens; nothing is lost.

## 2. Only send codes to approved reviewers

**Authentication → Auth Hooks → Add hook → "Before User Created"**:
- Hook type: **Postgres**
- Schema: `public`, function: `hook_reviewers_only`
- Save (make sure it's enabled).

This makes Supabase check the `reviewers` list before creating an account, so a code
is only emailed to approved addresses. Anyone else sees "This email isn't on the
reviewer list".

## 3. Email the codes from your own address

Supabase's built-in email only delivers to members of your Supabase team, at about 2
emails an hour, so colleagues need your own sender. A Gmail account made just for the
app keeps your personal address private.

1. In that Gmail account, turn on 2-Step Verification, then create an **App password**
   (Google Account → Security → App passwords).
2. Supabase → **Authentication → Emails → SMTP Settings** → enable custom SMTP:
   host `smtp.gmail.com`, port `465`, username = the Gmail address, password = the
   app password, sender name "Mole Madness".
3. **Authentication → Emails → Templates → Magic Link**: replace the message with the code,
   for example:
   ```html
   <h2>Your Mole Madness sign-in code</h2>
   <p>Enter this code in the app: <strong>{{ .Token }}</strong></p>
   <p>It expires in an hour. If you didn't ask for it, you can ignore this email.</p>
   ```

## 4. Connect the site

Supabase → **Project Settings → API Keys**: copy the **publishable** key (older projects
call it "anon public"). It's safe in a public repo. **Never** use the `secret` /
`service_role` key in the app or commit it. The project URL is
`https://<project-ref>.supabase.co`; `<project-ref>` is the ID in your dashboard's
address.

- Vercel → your project → **Settings → Environment Variables**, for Production (and
  Preview if you use preview links):
  - `VITE_SUPABASE_URL` = `https://<project-ref>.supabase.co`
  - `VITE_SUPABASE_KEY` = the publishable key

  Then **Deployments → ⋯ → Redeploy**. The settings are built into the site, so it
  needs a fresh build.
- For local development, create `webapp/.env.local` with the same two lines
  (`VITE_SUPABASE_URL=...`). Files ending in `.local` are already gitignored.

## Day to day

**Approve a reviewer**: SQL Editor → `insert into public.reviewers (email, name) values ('dr.a@hospital.org', 'Dr A');`
(or add a row in Table Editor → reviewers, lowercase).

**Remove one**: `delete from public.reviewers where email = 'dr.a@hospital.org';`
They can't save anything after that, though a session they already started stays
signed in until it expires.

**Reviews**: Table Editor → `case_reviews`, with one row per reviewer and image:

| column | meaning |
|---|---|
| `review_set` | which set (e.g. `v1`) |
| `present` | the features the reviewer ticked |
| `unassessable` | checklist features they marked "can't assess" |
| `offered` | the checklist they were shown: the features Claude was asked about. Unticked and not "can't assess" means absent |
| `claude_present`, `claude_uncertain` | Claude's raw calls on that checklist. The rest of `offered` is what Claude called absent |
| `blind` | saved without filling in from, or seeing, Claude's calls |
| `initial_present`, `initial_unassessable`, `initial_blind` | their first save, kept if they change it later |
| `comment` | free text |

Useful queries (SQL Editor):

```sql
-- Progress per reviewer
select email, count(*) as reviewed, count(*) filter (where initial_blind) as blind
from public.case_reviews
where review_set = 'v1'
group by email
order by reviewed desc;

-- Comments, newest first
select updated_at, email, case_id, diagnosis, comment
from public.case_reviews
where comment is not null
order by updated_at desc;

-- Blind first calls vs Claude, per image: what only the reviewer saw, and what only Claude saw
select case_id, email,
       array(select unnest(initial_present) intersect select unnest(offered)
             except select unnest(claude_present))                         as reviewer_only,
       array(select unnest(claude_present)
             except select unnest(initial_present)
             except select unnest(initial_unassessable))                   as claude_only
from public.case_reviews
where initial_blind
order by case_id;
```

Ask Claude to turn these into agreement statistics (reviewer vs Claude, reviewer vs
reviewer) once a few people have finished the set.

**Changing the set**: don't change it while reviews are being collected. For a new round,
run `node scripts/export_review_set.mjs --name v2 --force` (in `webapp/`) and redeploy;
reviews are kept per set.

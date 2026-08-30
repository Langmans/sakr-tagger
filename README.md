# SAKR tagger

Tag a Fallout 4 armour with Skimpy Armor Keyword Resource keywords in a form, and
read back the patch line — for **RobCo Patcher** or **Complex Item Sorter**. Load
an existing file to edit it, or to convert it.

**→ [langmans.github.io/sakr-tagger](https://langmans.github.io/sakr-tagger/)**

Nothing to install and nothing is uploaded: the file you load is read in your own
browser and never leaves it.

Or run it yourself:

```bash
npm install && npm run dev
```

## The version switch

SAKR's two versions ship the **same plugin filename** and REDUX renumbered nearly
all of it: of the 40 keyword names in both, 35 have a different FormID.

A RobCo line names a keyword by `plugin|formid`, so ids belong to a version and a
file cannot be told by looking at it. Pick the wrong one and nothing fails —
RobCo attaches whatever keyword sits at that number and logs nothing, so a sheer
full-body suit comes out as a micro skirt with hot pants and a sheer bra.

So every keyword here carries **both** ids, the model stores **names**, and the
id is looked up at export time. Throwing the switch renumbers the whole page,
which is what makes converting an imported legacy patch a single click.

Loading an ini detects the version rather than assuming it: an id in the `0x26xx`
range exists in 1.1.2 and in no REDUX record, so one of them settles the
question. Nothing proves REDUX, so a file without such an id is read as whatever
is selected, and the page says that is what it did.

## The two formats

**RobCo Patcher** names the armour and the keyword by FormID, so it is tied to
one SAKR version — everything above applies to it.

**Complex Item Sorter** matches on EditorID and names keywords by name, so it has
no version problem at all. Output is one file per plugin, which is how Complex
Sorter reads them; save each as `SAKR_<plugin>.ini` under
`Complex Sorter/Plugins/`.

That difference is also why converting between the two is not automatic: a RobCo
line carries a FormID and a Complex Sorter rule needs an EditorID, and only
somebody with the plugin open in xEdit can supply it. Rows without one are listed
in a comment rather than silently dropped.

Loading a Complex Sorter file keeps conditions it cannot represent in the form —
`EDID contains A|B`, several clauses, a `not` — verbatim, and writes them back
unchanged. Checked against all 15 files SAKR REDUX ships: 157 rules, all
round-tripping unchanged bar one, where the source sets two mutually exclusive
Top keywords on the same record. That one is reported on screen rather than
quietly resolved.

## The male keywords

REDUX adds 30 `_MALE` keywords and the form has them, per armour, behind the
**Body** switch. They are not a suffix on the same records: seven groups rather
than eight, no bra and no skirt, and the top steps Full → Breast → Small
Coverage where the female set steps Full → Cleavage → Low Cut.

1.1.2 has no male set at all, so a male armour cannot be written as a 1.1.2 RobCo
line. The page says so rather than writing a short line. Complex Sorter is fine
either way.

`sakr_kwd_protectedItem` is not in the form: it marks an item for REDUX's own
unequip handling rather than describing how much it covers.

## Publishing a new version

There is no Actions workflow, so the built site is pushed to `gh-pages` by hand.
`vite.config.js` sets `base` to the repository name for the build only, because a
project page serves from `/sakr-tagger/` rather than from the domain root.

```bash
npm run build && git worktree add -B gh-pages .pages && cp -r dist/. .pages/ && touch .pages/.nojekyll && git -C .pages add -A && git -C .pages commit -m "Build of main for GitHub Pages" && git -C .pages push -f origin gh-pages && git worktree remove --force .pages
```

## The mods this is for

None of these are mine. This only writes files that they read.

- **Skimpy Armor Keyword Resource REDUX** by Evi1Panda —
  [LoversLab](https://www.loverslab.com/topic/262924-skimpy-armor-keyword-resource-redux/),
  source at [NoAbleEngles/SAKR](https://github.com/NoAbleEngles/SAKR). The
  keyword ids and the Complex Sorter file layout here were read out of it.
- **Skimpy Armor Keyword Resource 1.1.2**, the older LoversLab release, which is
  the other half of the version problem.
- **RobCo Patcher** — [Nexus](https://www.nexusmods.com/fallout4/mods/69798).
- **Complex Item Sorter** by M8r98a4f2 —
  [Nexus](https://www.nexusmods.com/fallout4/mods/48826).

## Related

[sakr-patch-converter](https://github.com/Langmans/sakr-patch-converter) —
the same conversion for whole folders of inis at once, as a PowerShell script
that writes copies and never touches the originals. Its `keyword-ids.md` has the
full id table and how the finding was tested before it was believed.

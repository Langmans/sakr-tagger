# SAKR tagger

Tag a Fallout 4 armour with Skimpy Armor Keyword Resource keywords in a form, and
read back the RobCo Patcher line. Load an existing ini to edit it, or to convert
it.

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

## What it does not cover

The 40 keywords in the form are the female set, the only one both versions have.
REDUX adds 30 `_MALE` variants — six garment types rather than eight, with their
own names and ids — and `sakr_kwd_protectedItem`. None of them are here yet.

This only matters one way round: a 1.1.2 patch cannot name a REDUX-only keyword,
so nothing is lost on import or conversion.

## Publishing a new version

There is no Actions workflow, so the built site is pushed to `gh-pages` by hand.
`vite.config.js` sets `base` to the repository name for the build only, because a
project page serves from `/sakr-tagger/` rather than from the domain root.

```bash
npm run build && git worktree add -B gh-pages .pages && cp -r dist/. .pages/ && touch .pages/.nojekyll && git -C .pages add -A && git -C .pages commit -m "Build of main for GitHub Pages" && git -C .pages push -f origin gh-pages && git worktree remove --force .pages
```

## Related

[sakr-patch-converter](https://github.com/Langmans/sakr-patch-converter) —
the same conversion for whole folders of inis at once, as a PowerShell script
that writes copies and never touches the originals. Its `keyword-ids.md` has the
full id table and how the finding was tested before it was believed.

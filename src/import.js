/* Reading a patch back into armours you can edit.
 *
 * Two formats, and the file says which it is:
 *
 * - **RobCo Patcher** names the armour and the keyword by FormID. The hard part
 *   is that an id on its own does not say which SAKR it was written for. 35 of
 *   the 40 shared keywords were renumbered, so the same number names a different
 *   keyword in each version, and reading it as the wrong one produces a page
 *   that looks filled in and is wrong. So the version is detected rather than
 *   assumed, and where it cannot be detected the caller's choice is used and
 *   reported as a guess.
 *
 * - **Complex Item Sorter** names keywords by name and armours by EditorID.
 *   Nothing is numbered, so there is no version to get wrong.
 */

import { BY_NAME, ALL_KEYWORDS } from "./keywords.js";

/* The name comment above a line is optional -- a hand-written ini rarely has one
   -- so it is a non-capturing optional group rather than a requirement.
 *
   Every class excludes the newline, including the one inside the quotes. A bare
   [^"]+ there also matches line breaks, so the name runs from the first quote in
   the file to some quote several lines down and swallows the armours in
   between: one match for the whole file, and the failure looks like an ini with
   one entry rather than like a broken regex. */
export const INI_STRING_PATTERN =
  /(?:^[ \t]*\/\/[^\n"]*"([^"\n]+)"[^\n]*\r?\n)?[ \t]*filterByArmors=([^|\n]+)\|([^:\n]+):keywordsToAdd=([^\n]+)/gm;

/* A Complex Sorter rule: everything left of the `=` is the condition, everything
   right of it the actions. The comment above it is this app's own doing rather
   than the format's, so it is optional here too.
 *
   The whole condition is captured rather than one operator, because real files
   are not all `EDID equals`. Of the rules in the SAKR and FIS packs on this
   machine, `equals` is the most common but `contains` and `beginsWith` are
   everywhere, and a condition may be a list:

     EDID contains Jeans|Pants, not EDID contains Bermudas = SPECIAL:...

   Modelling that as an operator plus a value would either lose the extra
   clauses or need a small language. Keeping the text and writing it back
   unchanged loses nothing and cannot misread anything. */
export const CIS_RULE_PATTERN =
  /(?:^[ \t]*;[ \t]*([^\n]+)\r?\n)?^[ \t]*((?:not[ \t]+)?[A-Z]{2,8}[ \t]+[A-Za-z]+[^\n=]*?)[ \t]*=[ \t]*(SPECIAL:[^\n]+)/gim;

/* A condition that names exactly one record by its EditorID, which is the only
   shape the plain EditorID field can round-trip. Anything else is kept verbatim
   and shown as a raw rule. */
const SIMPLE_EDID = /^EDID[ \t]+(equals|contains|beginsWith|endsWith)[ \t]+([^,]+)$/i;

/** The operators the EditorID field offers. */
export const EDID_OPS = Object.freeze({
  equals: "equals",
  contains: "contains",
  beginsWith: "begins with",
  endsWith: "ends with",
});

/** version -> { id: keyword }. Ids are upper case; an ini may use either. */
const BY_ID = {
  redux: index("redux"),
  legacy: index("legacy"),
};

function index(version) {
  return ALL_KEYWORDS.reduce((map, keyword) => {
    if (keyword[version]) map[keyword[version].toUpperCase()] = keyword;
    return map;
  }, Object.create(null));
}

/* An id in the 0x26xx range exists in 1.1.2 and in no REDUX record, so one of
   them settles the question on its own. There is no equivalent proof the other
   way: every REDUX id in the 0x08xx range is also a legacy id, just of a
   different keyword. */
const LEGACY_ONLY = /^0026[0-9A-F]{2}$/;

/**
 * Which format an ini is written in.
 *
 * @param {String} text
 * @returns {'robco'|'complexSorter'|null}
 */
export function detectFormat(text) {
  const s = String(text);
  if (/filterByArmors\s*=/i.test(s)) return "robco";
  if (/^\s*\[Plugin\]/im.test(s) || /SPECIAL:AddKeyword:KEYWORDS:/i.test(s)) {
    return "complexSorter";
  }
  return null;
}

/**
 * Which SAKR an ini's ids belong to.
 *
 * A Complex Sorter file answers this differently from a RobCo one: it carries no
 * ids at all, so it belongs to neither version and needs no conversion. That is
 * reported as `versionless` rather than as a failure to detect, because the two
 * mean opposite things to the person reading the screen.
 *
 * @param {String} iniText
 * @returns {{version: String|null, proven: Boolean, versionless: Boolean}}
 */
export function detectVersion(iniText) {
  const text = String(iniText);

  if (detectFormat(text) === "complexSorter") {
    return { version: null, proven: false, versionless: true };
  }

  const ids = Array.from(
    text.matchAll(/SkimpyArmorKeywordResource\.esm\|([0-9A-Fa-f]{6})/g),
    (m) => m[1].toUpperCase(),
  );

  if (ids.some((id) => LEGACY_ONLY.test(id))) {
    return { version: "legacy", proven: true, versionless: false };
  }
  return { version: null, proven: false, versionless: false };
}

/* The model Armor.vue edits: a radio keyword is stored under its group, a
   checkbox under its own name.
 *
   A group holds one choice, because its keywords are steps on one axis -- a top
   is Full or Cleavage or LowCut, not two of them. Files in the wild do
   occasionally set two anyway (SAKR's own CCOFoxyFactionsReplacer gives
   ClothesFather both topFull and topCleavage), and the form cannot show that.
   The first is kept and the rest are REPORTED rather than dropped quietly:
   losing a keyword without saying so is the exact failure this app exists to
   catch. */
function selectionFrom(keywordList) {
  const selected = {};
  const conflicts = [];

  for (const keyword of keywordList) {
    if (keyword.type !== "radio") {
      selected[keyword.name] = true;
      continue;
    }
    if (selected[keyword.group]) {
      conflicts.push({
        group: keyword.group,
        kept: selected[keyword.group],
        dropped: keyword.name,
      });
      continue;
    }
    selected[keyword.group] = keyword.name;
  }

  return { selected, conflicts };
}

/* A row's body decides which set it belongs to, rather than a setting: a file
   may hold both, and the keywords themselves already say. Male wins on a tie
   only because a mixed row is broken either way and one of the two has to be
   picked to show it at all. */
function sexOf(keywordList) {
  return keywordList.some((k) => k.sex === "male") ? "male" : "female";
}

function parseRobco(text, assume) {
  const detected = detectVersion(text);
  const version = detected.version ?? assume;
  const table = BY_ID[version] ?? BY_ID.redux;

  const results = [];

  for (const match of text.matchAll(INI_STRING_PATTERN)) {
    const [, name, mod, armorFormid, keywordsRaw] = match;

    const found = [];
    const unknown = [];

    for (const entry of keywordsRaw.split(",")) {
      const [plugin, rawId] = entry.trim().split("|");
      const id = (rawId ?? "").toUpperCase();
      const keyword = table[id];

      /* Kept aside rather than dropped: a line with a keyword from another
         resource is a real thing, and losing it on load would be silent. */
      if (!keyword) unknown.push(`${plugin}|${rawId}`);
      else found.push(keyword);
    }

    const { selected, conflicts } = selectionFrom(found);

    results.push({
      name: name || null,
      mod: mod.trim(),
      formid: armorFormid.trim(),
      editorId: "",
      edidOp: "equals",
      rawMatch: "",
      sex: sexOf(found),
      keywords: selected,
      conflicts,
      unknown,
      open: true,
    });
  }

  return { armors: results, format: "robco", version, proven: detected.proven,
    versionless: false };
}

function parseComplexSorter(text) {
  /* `requiredFiles = X.esp` is the only place the plugin is named in a form we
     can reuse; the [Mod.X.Rules] section name has the extension stripped. */
  const required = /^\s*requiredFiles\s*=\s*([^\n;]+)/im.exec(text);
  const mod = required ? required[1].trim().split(",")[0].trim() : "";

  const results = [];

  for (const match of text.matchAll(CIS_RULE_PATTERN)) {
    const [, comment, condition, actions] = match;

    const found = [];
    const unknown = [];

    for (const action of actions.split(",")) {
      const hit = /SPECIAL:AddKeyword:KEYWORDS:\s*(\S+)/i.exec(action.trim());
      if (!hit) continue;
      const keyword = BY_NAME[hit[1]];
      if (!keyword) unknown.push(hit[1]);
      else found.push(keyword);
    }

    /* A rule that adds no keyword is not an armour of ours. Complex Sorter files
       carry plenty of them -- naming, tagging, priority -- and turning those
       into empty rows would bury the ones that matter. */
    if (found.length === 0 && unknown.length === 0) continue;

    const simple = SIMPLE_EDID.exec(condition.trim());
    const { selected, conflicts } = selectionFrom(found);

    results.push({
      name: comment ? comment.trim() : null,
      mod,
      formid: "",
      editorId: simple ? simple[2].trim() : "",
      edidOp: simple ? simple[1] : "equals",
      /* Kept only when the condition is more than one EDID test, so the common
         case stays editable in the form and the awkward case survives intact. */
      rawMatch: simple ? "" : condition.trim(),
      sex: sexOf(found),
      keywords: selected,
      conflicts,
      unknown,
      open: true,
    });
  }

  return { armors: results, format: "complexSorter", version: null,
    proven: false, versionless: true };
}

/**
 * @param {String} iniText
 * @param {String} [assume]  which version to read RobCo ids as when the file
 *        does not prove one. Ignored for Complex Sorter, which has no ids.
 * @returns {{armors: Array, format: String|null, version: String|null,
 *            proven: Boolean, versionless: Boolean}}
 */
export function parseIniString(iniText, assume = "redux") {
  const text = String(iniText);
  const format = detectFormat(text);

  if (format === "complexSorter") return parseComplexSorter(text);
  if (format === "robco") return parseRobco(text, assume);

  return { armors: [], format: null, version: null, proven: false,
    versionless: false };
}

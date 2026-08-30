/* Turning tagged armour into a patch, in either of the two formats that tag
 * armour with SAKR keywords.
 *
 * ## RobCo Patcher -- by FormID
 *
 * `filterByArmors=Plugin.esp|013C1B:keywordsToAdd=SkimpyArmorKeywordResource.esm|00081B`
 *
 * Names the armour and the keyword by number, so both ends are version
 * sensitive. SAKR's two versions ship the same plugin filename and renumbered 35
 * of their 40 shared keywords, so a line built against the wrong one does not
 * fail -- RobCo logs nothing for a form it cannot find, and most legacy ids land
 * on a real REDUX keyword that is a different one. Hence the keyword names in a
 * comment above every line and the version in the file header: without them
 * there is nothing to check an ini against by eye.
 *
 * ## Complex Item Sorter -- by EditorID and keyword NAME
 *
 * `EDID equals SomeArmor = SPECIAL:AddKeyword:KEYWORDS:sakr_kwd_topFull`
 *
 * No numbers anywhere, so **this format has no version problem at all**. It also
 * means it cannot use the FormID a RobCo line has: converting between the two
 * formats needs the armour's EditorID, which only the person with the plugin
 * open can supply.
 *
 * An armour comes from Armor.vue as
 * { mod, formid, editorId, name, sex, keywords }.
 */

import { formidFor, VERSIONS, BY_NAME } from "./keywords.js";

const PLUGIN = "SkimpyArmorKeywordResource.esm";

/** The formats this can write. Keys are what the export functions accept. */
export const FORMATS = Object.freeze({
  robco: "RobCo Patcher",
  complexSorter: "Complex Item Sorter",
});

/**
 * The keywords an armour has on, as names.
 *
 * The editor's model mixes two shapes, because the form does: a radio group
 * stores the chosen keyword under the GROUP's key, a checkbox stores true under
 * the KEYWORD's own key. Flattening that lives here so the export and the
 * component cannot drift -- an armour straight out of the importer has no
 * keywordNames yet, and reading it without this returns a line with no keywords
 * on it, which is a valid-looking patch that does nothing.
 *
 * @param {Object} armor
 * @returns {String[]}
 */
export function keywordNamesOf(armor) {
  /* `keywords` wins where both exist. It is what the form writes; keywordNames
     is a copy kept beside it, and a copy can be one tick behind. Falling back to
     it covers an armour built by hand or by a caller that only has the names. */
  if (!armor?.keywords && Array.isArray(armor?.keywordNames)) {
    return armor.keywordNames;
  }

  /* Both bodies, always. One ARMO record carries a male model and a female one
     and either can wear it, and SAKR reads the keyword set matching whoever has
     it on -- sakr.json holds two sets keyed `gender`. So the sets are additive
     rather than exclusive: tagging only the female one leaves a male wearer with
     nothing to read, silently. */
  return SELECTABLE.flatMap((sex) => namesIn(armor?.keywords?.[sex]));
}

const SELECTABLE = ["female", "male"];

function namesIn(selection) {
  return Object.entries(selection ?? {}).flatMap(([key, value]) => {
    if (value === true) return key;
    if (typeof value === "string" && value.length > 0) return value;
    return [];
  });
}

/** Only the names this build knows, in the order the form holds them. */
function chosenKeywords(armor) {
  return keywordNamesOf(armor).filter((name) => BY_NAME[name]);
}

const shortName = (name) => name.replace(/^sakr_kwd_/, "");

/* ------------------------------------------------------------ RobCo Patcher */

/**
 * The header a generated RobCo ini should open with. Says which SAKR the ids are
 * for, because the file itself cannot be told by looking at it.
 *
 * @param {String} version
 * @returns {String}
 */
export function exportHeader(version) {
  return [
    `// SAKR keyword ids for ${VERSIONS[version] ?? version}.`,
    "//",
    "// The two SAKR versions ship the same plugin filename and renumbered 35 of",
    "// their 40 shared keywords, so these ids are wrong for the other one -- and",
    "// wrong quietly: RobCo attaches whatever keyword sits at the number and",
    "// logs nothing. Check the names in the comments against what you meant.",
  ].join("\n");
}

/**
 * @param {Object} armor
 * @param {String} version  'redux' or 'legacy'
 * @returns {String|undefined}
 */
export function exportSingle(armor, version = "redux") {
  if (armor === null || typeof armor !== "object") {
    console.error("exportSingle expects object");
    return;
  }

  const { mod, formid, name } = armor;

  const chosen = chosenKeywords(armor);
  const names = chosen.map(shortName);
  const ids = chosen.map((n) => formidFor(BY_NAME[n], version));

  /* A keyword with no id under this version would silently shorten the line, so
     say so instead. Every male keyword hits this under 1.1.2, which has no male
     set at all. */
  const missing = chosen.filter((n, i) => !ids[i]).map(shortName);

  const heading =
    missing.length === 0
      ? `// "${name ?? "unknown"}": ${names.join(", ")}`
      : `// "${name ?? "unknown"}": ${names.join(", ")}\n` +
        `// !! no ${version} id for ${missing.join(", ")} -- left out of the line below`;

  /* An armour with no plugin or no id has nothing to filter on. Saying which
     field is empty beats writing `filterByArmors=undefined|undefined`, which
     looks like a line and is one RobCo silently ignores. */
  const lacks = [!mod && "Mod", !formid && "Formid"].filter(Boolean);
  if (lacks.length) {
    return [heading, `// (no line yet -- fill in ${lacks.join(" and ")})`].join("\n");
  }

  return [
    heading,
    `filterByArmors=${mod}|${formid}:keywordsToAdd=${ids
      .filter(Boolean)
      .map((id) => `${PLUGIN}|${id}`)
      .join(",")}`,
  ].join("\n");
}

/**
 * @param {Array} armors
 * @param {String} version  'redux' or 'legacy'
 * @returns {String}
 */
export function exportMultiple(armors, version = "redux") {
  const lines = Array.from(armors ?? [])
    .filter((armor) => armor !== null && typeof armor === "object")
    .map((armor) => exportSingle(armor, version))
    .filter((line) => typeof line === "string");

  return [exportHeader(version), "", ...lines].join("\n");
}

/* ------------------------------------------------- Complex Item Sorter */

/** `HN66Fo4_TRS.esp` -> `HN66Fo4_TRS`, which is what a [Mod.X] section wants. */
export function pluginBase(mod) {
  return String(mod ?? "").replace(/\.(esp|esm|esl)$/i, "");
}

/**
 * The left-hand side of a Complex Sorter rule for one armour.
 *
 * A rule imported with a condition this form cannot represent -- several
 * clauses, a `not`, a field other than EDID -- carries it verbatim in
 * `rawMatch` and is written back exactly as it came in. Rewriting such a rule
 * as `EDID equals` would silently widen or narrow what it matches.
 *
 * @returns {String} empty when there is nothing to match on
 */
export function conditionFor(armor) {
  const raw = armor?.rawMatch?.trim();
  if (raw) return raw;

  const edid = armor?.editorId?.trim();
  if (!edid) return "";

  const op = armor?.edidOp || "equals";
  return `EDID ${op} ${edid}`;
}

/**
 * One Complex Sorter plugin ini: the [Plugin] block plus a rule per armour.
 *
 * One file per PLUGIN rather than per armour, which is how Complex Sorter reads
 * them -- the section name and `requiredFiles` both carry the plugin, so armours
 * from two mods cannot share a file. Save it as `SAKR_<plugin>.ini` under
 * `Complex Sorter/Plugins/`.
 *
 * Rules match `EDID equals`, so an armour with no EditorID cannot be written.
 * Those are listed in a comment rather than dropped, because a patch that is
 * quietly missing an outfit is the failure this whole app exists to prevent.
 *
 * @param {String} mod      the esp/esm these armours live in
 * @param {Array}  armors   armours from that plugin
 * @returns {String}
 */
export function exportComplexSorter(mod, armors) {
  const base = pluginBase(mod);
  const list = Array.from(armors ?? []).filter(
    (a) => a !== null && typeof a === "object",
  );

  const head = [
    "[Plugin]",
    `id = cpp_SAKR_${base}`,
    `name = SAKR ${base}`,
    "desc = Tag armor, clothing with skimpy keywords.",
    "type = pluginRecordModifier",
    "cachable = true",
    "defaultRulesPriority = (1)",
    "visibleDefault = false",
    "activeDefault = true",
    "useTagSet = FIS2",
    `requiredFiles = ${mod}`,
    "requiredRecordTypes = ARMO",
    `task = SAKR:${base}`,
    "",
    "; Keywords are named, not numbered, so this file works with either SAKR",
    "; version. That is the one real advantage this format has over RobCo.",
    "",
    `[Mod.${base}.Rules.ARMO.prefilter]`,
    "*=KEEP",
    "",
    `[Mod.${base}.Rules.ARMO]`,
    "",
  ];

  const rules = [];
  const skipped = [];

  for (const armor of list) {
    const chosen = chosenKeywords(armor);
    if (chosen.length === 0) continue;

    const condition = conditionFor(armor);
    if (!condition) {
      skipped.push(armor.name || armor.formid || "unnamed");
      continue;
    }

    if (armor.name) rules.push(`; ${armor.name}`);
    rules.push(
      `${condition} = ` +
        chosen.map((n) => `SPECIAL:AddKeyword:KEYWORDS:${n}`).join(", "),
      "",
    );
  }

  const tail = skipped.length
    ? [
        "; Left out, because a Complex Sorter rule matches on EditorID and these",
        "; have none filled in. Open the plugin in xEdit and copy their EDID:",
        ...skipped.map((n) => `;   ${n}`),
      ]
    : [];

  return [...head, ...rules, ...tail].join("\n").replace(/\n{3,}/g, "\n\n");
}

/**
 * Every armour on the page as Complex Sorter files, one per plugin.
 *
 * @param {Array} armors
 * @returns {Array<{mod: String, filename: String, text: String}>}
 */
export function exportComplexSorterAll(armors) {
  const byMod = new Map();

  for (const armor of Array.from(armors ?? [])) {
    if (!armor || typeof armor !== "object") continue;
    const mod = armor.mod?.trim();
    if (!mod) continue;
    if (!byMod.has(mod)) byMod.set(mod, []);
    byMod.get(mod).push(armor);
  }

  return [...byMod.entries()].map(([mod, list]) => ({
    mod,
    filename: `SAKR_${pluginBase(mod)}.ini`,
    text: exportComplexSorter(mod, list),
  }));
}

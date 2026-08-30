/* Turning a tagged armour into RobCo Patcher lines.
 *
 * Two things every line carries, and both are here because the same mistake is
 * otherwise invisible:
 *
 * - The KEYWORD NAMES, in a comment above the ids and in the same order. RobCo
 *   logs nothing for a form it cannot find, so the names are the only way to
 *   check an ini by eye or with a script.
 *
 * - The VERSION the ids belong to, in the file header. SAKR's two versions ship
 *   the same plugin filename and renumbered 35 of their 40 shared keywords, so
 *   an ini built against the wrong one does not fail -- it silently tags a
 *   garment as something else.
 *
 * The armour object comes from Armor.vue: { mod, formid, name, keywordNames }.
 * The ids are looked up here rather than carried in, so one version switch
 * changes every line at once.
 */

import keywords, { formidFor, VERSIONS } from "./keywords.js";

const PLUGIN = "SkimpyArmorKeywordResource.esm";

/** name -> the keyword entry, so an id is a lookup per version. */
const BY_NAME = Object.values(keywords)
  .flat()
  .reduce((map, keyword) => {
    map[keyword.name] = keyword;
    return map;
  }, Object.create(null));

/**
 * The keywords an armour has on, as names.
 *
 * The editor's model mixes two shapes, because the form does: a radio group
 * stores the chosen keyword under the GROUP's key, a checkbox stores true under
 * the KEYWORD's own key. Flattening that lives here so the export and the
 * component cannot drift -- an armour straight out of the importer has no
 * keywordNames yet, and reading it without this returns a line with no keywords
 * on it, which is a valid-looking ini that does nothing.
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

  return Object.entries(armor?.keywords ?? {}).flatMap(([key, value]) => {
    if (value === true) return key;
    if (typeof value === "string" && value.length > 0) return value;
    return [];
  });
}

/**
 * The header a generated ini should open with. Says which SAKR the ids are for,
 * because the file itself cannot be told by looking at it.
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
 * @param {Array|String[]} armors
 * @param {String} version  'redux' or 'legacy'
 * @returns {String}
 */
export function exportMultiple(armors, version = "redux") {
  // is iterable?
  if ((!Symbol.iterator) in Object(armors)) {
    console.error("exportMultiple expects iterable");
    return "";
  }

  const lines = Array.from(armors)
    .filter((armor) => armor !== null && typeof armor === "object")
    .map((armor) => exportSingle(armor, version))
    .filter((line) => typeof line === "string");

  return [exportHeader(version), "", ...lines].join("\n");
}

/**
 * @param {Object} armor
 * @param {String} version  'redux' or 'legacy'
 * @returns {String|null}
 */
export function exportSingle(armor, version = "redux") {
  if (armor === null || typeof armor !== "object") {
    console.error("exportSingle expects object");
    return;
  }

  const { mod, formid, name } = armor;

  const chosen = keywordNamesOf(armor).filter((n) => BY_NAME[n]);
  const names = chosen.map((n) => n.replace(/^sakr_kwd_/, ""));
  const ids = chosen.map((n) => formidFor(BY_NAME[n], version));

  /* A name with no id under this version would silently shorten the line, so
     say so instead. It cannot happen with the table as it stands -- all 40
     keywords exist in both versions -- but it is exactly what a future
     version-only keyword would do. */
  const missing = chosen.filter((n, i) => !ids[i]).map((n) => n);

  const heading =
    missing.length === 0
      ? `// "${name ?? "unknown"}": ${names.join(", ")}`
      : `// "${name ?? "unknown"}": ${names.join(", ")}  // no ${version} id for ${missing.join(", ")}`;

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

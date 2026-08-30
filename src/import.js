/* Reading a RobCo Patcher ini back into armours you can edit.
 *
 * The hard part is not the parsing, it is that an id on its own does not say
 * which SAKR it was written for. 35 of the 40 shared keywords were renumbered,
 * so the same number names a different keyword in each version and reading it as
 * the wrong one produces a page that looks filled in and is wrong.
 *
 * So the version is detected rather than assumed, and where it cannot be
 * detected the caller's choice is used and reported as a guess.
 */

import keywords from "./keywords.js";

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

/** Every keyword, flat, with the group it belongs to. */
const ALL = Object.entries(keywords).flatMap(([group, entries]) =>
  entries.map((keyword) => ({ ...keyword, group })),
);

/** version -> { id: keyword }. Ids are upper case; an ini may use either. */
const BY_ID = {
  redux: index("redux"),
  legacy: index("legacy"),
};

function index(version) {
  return ALL.reduce((map, keyword) => {
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
 * Which SAKR an ini's ids belong to.
 *
 * @param {String} iniText
 * @returns {{version: String|null, proven: Boolean}}  version is null when
 *          nothing in the file settles it; `proven` says whether the answer was
 *          read off the file or is the caller's to decide.
 */
export function detectVersion(iniText) {
  const ids = Array.from(
    String(iniText).matchAll(/SkimpyArmorKeywordResource\.esm\|([0-9A-Fa-f]{6})/g),
    (m) => m[1].toUpperCase(),
  );

  if (ids.some((id) => LEGACY_ONLY.test(id))) {
    return { version: "legacy", proven: true };
  }
  return { version: null, proven: false };
}

/**
 * @param {String} iniText
 * @param {String} [assume]  which version to read ids as when the file does not
 *        prove one. Defaults to REDUX.
 * @returns {Array<Object>}  armours in the shape Armor.vue edits
 */
export function parseIniString(iniText, assume = "redux") {
  const detected = detectVersion(iniText);
  const version = detected.version ?? assume;
  const table = BY_ID[version] ?? BY_ID.redux;

  const results = [];

  for (const match of String(iniText).matchAll(INI_STRING_PATTERN)) {
    const [, name, mod, armorFormid, keywordsRaw] = match;

    /* The model Armor.vue edits: a radio keyword is stored under its group, a
       checkbox under its own name. Anything this table does not know is kept
       aside rather than dropped, because a line with a keyword from another
       resource is a real thing and losing it on load would be silent. */
    const selected = {};
    const unknown = [];

    for (const entry of keywordsRaw.split(",")) {
      const [plugin, rawId] = entry.trim().split("|");
      const id = (rawId ?? "").toUpperCase();
      const keyword = table[id];

      if (!keyword) {
        unknown.push(`${plugin}|${rawId}`);
        continue;
      }

      if (keyword.type === "radio") selected[keyword.group] = keyword.name;
      else selected[keyword.name] = true;
    }

    results.push({
      name: name || null,
      mod: mod.trim(),
      formid: armorFormid.trim(),
      keywords: selected,
      unknown,
      open: true,
    });
  }

  return { armors: results, version, proven: detected.proven };
}

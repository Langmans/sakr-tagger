/* SAKR keywords, with the FormID each version gives them.
 *
 * The two SAKR versions ship the SAME plugin filename,
 * SkimpyArmorKeywordResource.esm, and REDUX renumbered nearly all of it: of the
 * 40 female keyword names, 35 have a different id. Five match by coincidence.
 *
 * That is why a version has to be chosen rather than assumed. A RobCo Patcher
 * line names a keyword by plugin|formid, so an id written for the wrong version
 * does not fail -- RobCo logs nothing for a form it cannot find, and most legacy
 * ids land on a real REDUX keyword that is simply a different one. A sheer
 * full-body suit comes out as a micro skirt with hot pants and a sheer bra.
 *
 * Complex Item Sorter has none of this problem: it names keywords by NAME, and
 * names did not move. See export.js.
 *
 * Ids are local, with the load-order byte stripped, which is what a RobCo line
 * wants. Read out of both plugins directly; the full comparison and how it was
 * tested are in the sakr-patch-converter project, keyword-ids.md.
 */

/** The version a set of ids belongs to. Keys are what `formidFor` accepts. */
export const VERSIONS = Object.freeze({
  redux: "REDUX",
  legacy: "1.1.2 (legacy)",
});

/** Which body a set of keywords is for. Keys are what `setFor` accepts. */
export const SEXES = Object.freeze({
  female: "Female",
  male: "Male",
});

/**
 * One keyword's id under one version.
 *
 * Undefined where the version has no such record, which is every male keyword
 * under 1.1.2: that version has no male set at all. Callers must not treat the
 * gap as a zero -- an id-less keyword cannot go in a RobCo line.
 *
 * @param {Object} keyword  an entry from a group below
 * @param {String} version  'redux' or 'legacy'
 * @returns {String|undefined}
 */
export function formidFor(keyword, version) {
  return keyword?.[version];
}

const FEMALE = Object.freeze({
  armorTop: [
    {
      name: "sakr_kwd_armorTopFull",
      label: "Full",
      type: "radio",
      redux: "000801",
      legacy: "000802",
    },
    {
      name: "sakr_kwd_armorTopBreast",
      label: "Breast",
      type: "radio",
      redux: "000802",
      legacy: "000803",
    },
    {
      name: "sakr_kwd_armorTopLewd",
      label: "Lewd",
      type: "radio",
      redux: "000803",
      legacy: "000804",
    },
  ],
  armorBottom: [
    {
      name: "sakr_kwd_armorBottomFull",
      label: "Full",
      type: "radio",
      redux: "000804",
      legacy: "000805",
    },
    {
      name: "sakr_kwd_armorBottomButt",
      label: "Butt",
      type: "radio",
      redux: "000805",
      legacy: "000806",
    },
    {
      name: "sakr_kwd_armorBottomLewd",
      label: "Lewd",
      type: "radio",
      redux: "000806",
      legacy: "000807",
    },
  ],
  panty: [
    {
      name: "sakr_kwd_pantyNormal",
      label: "Normal",
      type: "radio",
      redux: "000807",
      legacy: "000808",
    },
    {
      name: "sakr_kwd_pantyThong",
      label: "Thong",
      type: "radio",
      redux: "000808",
      legacy: "000809",
    },
    {
      name: "sakr_kwd_pantyGString",
      label: "G-String",
      type: "radio",
      redux: "000809",
      legacy: "00080A",
    },
    {
      name: "sakr_kwd_pantyTagSheer",
      label: "Sheer",
      type: "checkbox",
      redux: "00080A",
      legacy: "0026B0",
    },
  ],
  bra: [
    {
      name: "sakr_kwd_braNormal",
      label: "Normal",
      type: "radio",
      redux: "00080B",
      legacy: "00080B",
    },
    {
      name: "sakr_kwd_braBikini",
      label: "Bikini",
      type: "radio",
      redux: "00080C",
      legacy: "00080C",
    },
    {
      name: "sakr_kwd_braMicroBikini",
      label: "Micro",
      type: "radio",
      redux: "00080D",
      legacy: "00080D",
    },
    {
      name: "sakr_kwd_braTagSheer",
      label: "Sheer",
      type: "checkbox",
      redux: "00080E",
      legacy: "0026AF",
    },
  ],
  pants: [
    {
      name: "sakr_kwd_pantsLong",
      label: "Long",
      type: "radio",
      redux: "00080F",
      legacy: "00080E",
    },
    {
      name: "sakr_kwd_pantsShorts",
      label: "Shorts",
      type: "radio",
      redux: "000811",
      legacy: "00080F",
    },
    {
      name: "sakr_kwd_pantsHotPants",
      label: "Hot Pants",
      type: "radio",
      redux: "000812",
      legacy: "000810",
    },
    {
      name: "sakr_kwd_pantsThong",
      label: "Thong",
      type: "radio",
      redux: "000814",
      legacy: "000811",
    },
    {
      name: "sakr_kwd_pantsTagTight",
      label: "Tight",
      type: "checkbox",
      redux: "000810",
      legacy: "000812",
    },
    {
      name: "sakr_kwd_pantsTagSheer",
      label: "Sheer",
      type: "checkbox",
      redux: "000813",
      legacy: "000813",
    },
  ],
  skirt: [
    {
      name: "sakr_kwd_skirtLong",
      label: "Long",
      type: "radio",
      redux: "000815",
      legacy: "000814",
    },
    {
      name: "sakr_kwd_skirtShort",
      label: "Short",
      type: "radio",
      redux: "000818",
      legacy: "000815",
    },
    {
      name: "sakr_kwd_skirtMini",
      label: "Mini",
      type: "radio",
      redux: "000819",
      legacy: "000816",
    },
    {
      name: "sakr_kwd_skirtMicro",
      label: "Micro",
      type: "radio",
      redux: "00081A",
      legacy: "000817",
    },
    {
      name: "sakr_kwd_skirtTagTight",
      label: "Tight",
      type: "checkbox",
      redux: "000816",
      legacy: "000818",
    },
    {
      name: "sakr_kwd_skirtTagSheer",
      label: "Sheer",
      type: "checkbox",
      redux: "000817",
      legacy: "000819",
    },
  ],
  top: [
    {
      name: "sakr_kwd_topFull",
      label: "Full",
      type: "radio",
      redux: "00081B",
      legacy: "00081A",
    },
    {
      name: "sakr_kwd_topCleavage",
      label: "Cleavage",
      type: "radio",
      redux: "00081C",
      legacy: "00081B",
    },
    {
      name: "sakr_kwd_topLowCutCleavage",
      label: "Low Cut",
      type: "radio",
      redux: "00081D",
      legacy: "00081C",
    },
    {
      name: "sakr_kwd_topTagTankTop",
      label: "Tank Top",
      type: "checkbox",
      redux: "000822",
      legacy: "00081E",
    },
    {
      name: "sakr_kwd_topTagCropTop",
      label: "Crop Top",
      type: "checkbox",
      redux: "00081E",
      legacy: "00081D",
    },
    {
      name: "sakr_kwd_topTagHalterTop",
      label: "Halter Top",
      type: "checkbox",
      redux: "00081F",
      legacy: "00081F",
    },
    {
      name: "sakr_kwd_topTagSideBoob",
      label: "Side Boob",
      type: "checkbox",
      redux: "000821",
      legacy: "000820",
    },
    {
      name: "sakr_kwd_topTagTight",
      label: "Tight",
      type: "checkbox",
      redux: "000823",
      legacy: "000821",
    },
    {
      name: "sakr_kwd_topTagSheer",
      label: "Sheer",
      type: "checkbox",
      redux: "000820",
      legacy: "000822",
    },
  ],
  stockings: [
    {
      name: "sakr_kwd_stockingsLong",
      label: "Long",
      type: "radio",
      redux: "000824",
      legacy: "0026B1",
    },
    {
      name: "sakr_kwd_stockingsTagShiny",
      label: "Shiny",
      type: "checkbox",
      redux: "000826",
      legacy: "0026B2",
    },
    {
      name: "sakr_kwd_stockingsTagSheer",
      label: "Sheer",
      type: "checkbox",
      redux: "000827",
      legacy: "0026B3",
    },
  ],
  shoes: [
    {
      name: "sakr_kwd_shoesHighHeels",
      label: "High Heels",
      type: "radio",
      redux: "000825",
      legacy: "0026B4",
    },
    {
      name: "sakr_kwd_shoesKillerHeels",
      label: "Killer Heels",
      type: "radio",
      redux: "000828",
      legacy: "0026B5",
    },
  ],
});

/* The male set, which exists in REDUX only -- 1.1.2 has no male keyword at all,
   so none of these carries a `legacy` id and none can go in a 1.1.2 patch.
 *
   Not a suffix on the same records: seven groups rather than eight, with no bra
   and no skirt, and the top varies differently. Where the female set steps
   Full -> Cleavage -> LowCutCleavage, this one steps Full -> Breast ->
   SmallCoverage, and it has a front-torso tag with no female counterpart. So it
   is a separate table rather than a name transform, and reusing the female
   chain would produce plausible wrong keywords instead of failing.

   Ids run 0x861..0x87E, read out of the plugin. */
const MALE = Object.freeze({
  armorTop: [
    { name: "sakr_kwd_armorTopFull_MALE", label: "Full", type: "radio", redux: "000861" },
    { name: "sakr_kwd_armorTopBreast_MALE", label: "Breast", type: "radio", redux: "000862" },
    { name: "sakr_kwd_armorTopLewd_MALE", label: "Lewd", type: "radio", redux: "000863" },
  ],
  armorBottom: [
    { name: "sakr_kwd_armorBottomFull_MALE", label: "Full", type: "radio", redux: "000864" },
    { name: "sakr_kwd_armorBottomButt_MALE", label: "Butt", type: "radio", redux: "000865" },
    { name: "sakr_kwd_armorBottomLewd_MALE", label: "Lewd", type: "radio", redux: "000866" },
  ],
  panty: [
    { name: "sakr_kwd_pantyNormal_MALE", label: "Normal", type: "radio", redux: "000867" },
    { name: "sakr_kwd_pantyThong_MALE", label: "Thong", type: "radio", redux: "000868" },
    { name: "sakr_kwd_pantyGString_MALE", label: "G-String", type: "radio", redux: "000869" },
    { name: "sakr_kwd_pantyTagSheer_MALE", label: "Sheer", type: "checkbox", redux: "00086A" },
  ],
  pants: [
    { name: "sakr_kwd_pantsLong_MALE", label: "Long", type: "radio", redux: "00086B" },
    { name: "sakr_kwd_pantsShorts_MALE", label: "Shorts", type: "radio", redux: "00086D" },
    { name: "sakr_kwd_pantsHotPants_MALE", label: "Hot Pants", type: "radio", redux: "00086E" },
    { name: "sakr_kwd_pantsThong_MALE", label: "Thong", type: "radio", redux: "000870" },
    { name: "sakr_kwd_pantsTagTight_MALE", label: "Tight", type: "checkbox", redux: "00086C" },
    { name: "sakr_kwd_pantsTagSheer_MALE", label: "Sheer", type: "checkbox", redux: "00086F" },
  ],
  top: [
    { name: "sakr_kwd_topFull_MALE", label: "Full", type: "radio", redux: "000871" },
    { name: "sakr_kwd_topBreast_MALE", label: "Breast", type: "radio", redux: "000872" },
    { name: "sakr_kwd_topSmallCoverage_MALE", label: "Small Coverage", type: "radio", redux: "000873" },
    { name: "sakr_kwd_topTagTankTop_MALE", label: "Tank Top", type: "checkbox", redux: "000878" },
    { name: "sakr_kwd_topTagCropTop_MALE", label: "Crop Top", type: "checkbox", redux: "000874" },
    { name: "sakr_kwd_topTagHalterTop_MALE", label: "Halter Top", type: "checkbox", redux: "000875" },
    { name: "sakr_kwd_topTagFrontTorso_MALE", label: "Front Torso", type: "checkbox", redux: "000877" },
    { name: "sakr_kwd_topTagTight_MALE", label: "Tight", type: "checkbox", redux: "000879" },
    { name: "sakr_kwd_topTagSheer_MALE", label: "Sheer", type: "checkbox", redux: "000876" },
  ],
  stockings: [
    { name: "sakr_kwd_stockingsLong_MALE", label: "Long", type: "radio", redux: "00087A" },
    { name: "sakr_kwd_stockingsTagShiny_MALE", label: "Shiny", type: "checkbox", redux: "00087C" },
    { name: "sakr_kwd_stockingsTagSheer_MALE", label: "Sheer", type: "checkbox", redux: "00087D" },
  ],
  shoes: [
    { name: "sakr_kwd_shoesHighHeels_MALE", label: "High Heels", type: "radio", redux: "00087B" },
    { name: "sakr_kwd_shoesKillerHeels_MALE", label: "Killer Heels", type: "radio", redux: "00087E" },
  ],
});

export const SETS = Object.freeze({ female: FEMALE, male: MALE });

/**
 * The keyword groups for one body.
 *
 * @param {String} sex  'female' or 'male'
 */
export function setFor(sex) {
  return SETS[sex] ?? FEMALE;
}

/** Every keyword in both sets, flat, each carrying the group it belongs to. */
export const ALL_KEYWORDS = Object.freeze(
  Object.entries(SETS).flatMap(([sex, groups]) =>
    Object.entries(groups).flatMap(([group, entries]) =>
      entries.map((keyword) => Object.freeze({ ...keyword, group, sex })),
    ),
  ),
);

/** name -> the keyword, for going from an ini back to the form. */
export const BY_NAME = Object.freeze(
  ALL_KEYWORDS.reduce((map, keyword) => {
    map[keyword.name] = keyword;
    return map;
  }, Object.create(null)),
);

export default FEMALE;

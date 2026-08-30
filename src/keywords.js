/* SAKR keywords, with the FormID each version gives them.
 *
 * The two SAKR versions ship the SAME plugin filename,
 * SkimpyArmorKeywordResource.esm, and REDUX renumbered nearly all of it: of the
 * 40 keyword names below, 35 have a different id. Five match by coincidence.
 *
 * That is why a version has to be chosen rather than assumed. A RobCo Patcher
 * line names a keyword by plugin|formid, so an id written for the wrong version
 * does not fail -- RobCo logs nothing for a form it cannot find, and most legacy
 * ids land on a real REDUX keyword that is simply a different one. A sheer
 * full-body suit comes out as a micro skirt with hot pants and a sheer bra.
 *
 * Only two ids die outright: shoesHighHeels and shoesKillerHeels, which REDUX
 * moved out of the 0x26xx range entirely. Those are the ones people notice,
 * because heels stop counting. The rest are silent.
 *
 * Ids are local, with the load-order byte stripped, which is what a RobCo line
 * wants. Measured from both plugins directly; the full comparison and how it was
 * tested are in the sakr-patch-converter project, keyword-ids.md.
 */

/** The version a set of ids belongs to. Keys are what `formidFor` accepts. */
export const VERSIONS = Object.freeze({
  redux: "REDUX",
  legacy: "1.1.2 (legacy)",
});

/**
 * One keyword's id under one version.
 *
 * @param {Object} keyword  an entry from the default export
 * @param {String} version  'redux' or 'legacy'
 * @returns {String|undefined}
 */
export function formidFor(keyword, version) {
  return keyword?.[version];
}

export default Object.freeze({
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

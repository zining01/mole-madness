// Quiz-level diagnosis taxonomy for the multiple-choice revamp.
//
// Maps the DERM12345 labels (see data_pipeline/create_json.py TAXONOMY) onto
// diagnoses that can be told apart on dermoscopy. The original `code` stays on
// every image record.
//
// Two modes:
//   basic    — diagnoses without `advancedOnly`
//   advanced — diagnoses without `advancedSplit`; a split diagnosis is replaced
//              by its children (Nevus → Banal nevus + Dysplastic nevus)
// Use diagnosesForMode(mode) rather than reading quizDiagnoses directly.
//
// `name` is the multiple-choice option. `subtypes` (on merged groups) gives the
// specific diagnosis to show in the answer reveal for each source code; see
// revealLabel().
//
// Counts are "images (unique patients)". Many patients contribute several images
// of the same lesion, so the patient count is the honest measure of variety.
//
// `differentials` are the diagnoses a learner would plausibly confuse with this
// one, in rough order of importance. Distractor rule (proposed): draw from
// differentials that are in the user's selected set first, then fill from other
// selected diagnoses in the same superclass, then any selected diagnosis.

export const quizDiagnoses = {
  // --- Melanocytic, benign ---
  nevus: {
    name: "Nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // jd 5275 (700), jb 1223 (292), cb 722 (325), cd 498 (224) → 7718 (869)
    codes: ["jb", "jd", "cb", "cd"],
    differentials: ["melanoma", "solar_lentigo", "intradermal_nevus", "congenital_nevus", "seb_keratosis"],
    advancedSplit: ["dysplastic_nevus", "banal_nevus"],
  },
  banal_nevus: {
    name: "Banal nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // jb 1223 (292), cb 722 (325) → 1945 (490)
    codes: ["jb", "cb"],
    differentials: ["dysplastic_nevus", "melanoma", "intradermal_nevus", "congenital_nevus", "solar_lentigo"],
    advancedOnly: true,
  },
  dysplastic_nevus: {
    name: "Dysplastic nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // jd 5275 (700), cd 498 (224) → 5773 (758)
    codes: ["jd", "cd"],
    differentials: ["melanoma", "banal_nevus", "seb_keratosis", "congenital_nevus", "spitz_reed"],
    advancedOnly: true,
  },
  intradermal_nevus: {
    name: "Intradermal nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // db 560 (251), mcb 123 (68) → 683 (301)
    codes: ["db", "mcb"],
    subtypes: { db: "Intradermal nevus", mcb: "Miescher nevus" },
    differentials: ["bcc", "seb_keratosis", "nevus", "congenital_nevus"],
    // Miescher nevus is labeled "compound" in the source but grouped here as a
    // dome-shaped intradermal nevus.
  },
  congenital_nevus: {
    name: "Congenital nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // ccb 418 (107), cjb 143 (33), ccd 32 (13) → 593 (139)
    codes: ["ccb", "cjb", "ccd"],
    differentials: ["nevus", "intradermal_nevus", "melanoma", "blue_nevus"],
    advancedSplit: ["dysplastic_congenital_nevus", "banal_congenital_nevus"],
  },
  banal_congenital_nevus: {
    name: "Banal congenital nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // ccb 418 (107), cjb 143 (33) → 561 (126)
    codes: ["ccb", "cjb"],
    differentials: ["dysplastic_congenital_nevus", "nevus", "intradermal_nevus", "blue_nevus"],
    advancedOnly: true,
  },
  dysplastic_congenital_nevus: {
    name: "Dysplastic congenital nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // ccd 32 (13)
    codes: ["ccd"],
    differentials: ["melanoma", "banal_congenital_nevus", "nevus", "intradermal_nevus"],
    advancedOnly: true,
  },
  acral_nevus: {
    name: "Acral nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // ajb 426 (200), ajd 288 (139), acb 37 (21), acd 9 (5) → 760 (330)
    codes: ["ajb", "ajd", "acb", "acd"],
    differentials: ["acral_melanoma", "nevus", "blue_nevus"],
    advancedSplit: ["dysplastic_acral_nevus", "banal_acral_nevus"],
  },
  banal_acral_nevus: {
    name: "Banal acral nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // ajb 426 (200), acb 37 (21) → 463 (212)
    codes: ["ajb", "acb"],
    differentials: ["dysplastic_acral_nevus", "acral_melanoma", "blue_nevus"],
    advancedOnly: true,
  },
  dysplastic_acral_nevus: {
    name: "Dysplastic acral nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // ajd 288 (139), acd 9 (5) → 297 (144)
    codes: ["ajd", "acd"],
    differentials: ["acral_melanoma", "banal_acral_nevus", "blue_nevus"],
    advancedOnly: true,
  },
  blue_nevus: {
    name: "Blue nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // bdb 163 (81)
    codes: ["bdb"],
    differentials: ["melanoma", "bcc", "angiokeratoma", "vascular_lesion"],
  },
  spitz_reed: {
    name: "Spitz / Reed nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // srjd 19 (8)
    codes: ["srjd"],
    differentials: ["melanoma", "nevus", "intradermal_nevus"],
    lowCount: true,
  },
  recurrent_nevus: {
    name: "Recurrent nevus",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // rd 16 (7)
    codes: ["rd"],
    differentials: ["melanoma", "nevus", "dermatofibroma"],
    lowCount: true,
  },
  solar_lentigo: {
    name: "Solar lentigo",
    superclass: "Melanocytic",
    malignancy: "Benign",
    // sl 60 (34), isl 6 (2) → 66 (36)
    codes: ["sl", "isl"],
    subtypes: { sl: "Solar lentigo", isl: "Ink spot lentigo" },
    differentials: ["lentigo_maligna", "seb_keratosis", "lichenoid_keratosis", "actinic_keratosis", "nevus"],
    // Ink spot lentigo is a solar lentigo variant.
  },

  // --- Melanocytic, malignant ---
  melanoma: {
    name: "Melanoma",
    superclass: "Melanocytic",
    malignancy: "Malignant",
    // mel 153 (49)
    codes: ["mel"],
    differentials: ["nevus", "seb_keratosis", "spitz_reed", "blue_nevus", "bcc", "congenital_nevus", "lichenoid_keratosis"],
  },
  lentigo_maligna: {
    name: "Lentigo maligna / LM melanoma",
    superclass: "Melanocytic",
    malignancy: "Malignant",
    // lm 86 (24), lmm 25 (6) → 111 (25)
    codes: ["lm", "lmm"],
    subtypes: { lm: "Lentigo maligna (in situ)", lmm: "Lentigo maligna melanoma (invasive)" },
    differentials: ["solar_lentigo", "seb_keratosis", "lichenoid_keratosis", "actinic_keratosis", "scc"],
    // Merged as one answer: both show the facial follicular patterns, and
    // invasion isn't reliably called on dermoscopy.
  },
  acral_melanoma: {
    name: "Acral melanoma",
    superclass: "Melanocytic",
    malignancy: "Malignant",
    // alm 60 (13), anm 76 (12) → 136 (24)
    codes: ["alm", "anm"],
    subtypes: { alm: "Acral lentiginous melanoma", anm: "Acral nodular melanoma" },
    differentials: ["acral_nevus", "melanoma", "blue_nevus"],
  },

  // --- Non-melanocytic, benign ---
  seb_keratosis: {
    name: "Seborrheic keratosis",
    superclass: "Nonmelanocytic",
    malignancy: "Benign",
    // sk 607 (180)
    codes: ["sk"],
    differentials: ["melanoma", "solar_lentigo", "bcc", "intradermal_nevus", "lichenoid_keratosis", "lentigo_maligna"],
  },
  lichenoid_keratosis: {
    name: "Lichenoid keratosis",
    superclass: "Nonmelanocytic",
    malignancy: "Benign",
    // lk 8 (6)
    codes: ["lk"],
    differentials: ["melanoma", "lentigo_maligna", "seb_keratosis", "solar_lentigo", "bcc"],
    advancedOnly: true,
    lowCount: true,
  },
  dermatofibroma: {
    name: "Dermatofibroma",
    superclass: "Nonmelanocytic",
    malignancy: "Benign",
    // df 180 (79)
    codes: ["df"],
    differentials: ["nevus", "melanoma", "bcc", "recurrent_nevus"],
  },
  vascular_lesion: {
    name: "Vascular lesion (hemangioma, lymphangioma)",
    superclass: "Nonmelanocytic",
    malignancy: "Benign",
    // ha 166 (60), la 56 (9), sa 14 (2) → 236 (67)
    codes: ["ha", "la", "sa"],
    subtypes: { ha: "Hemangioma", la: "Lymphangioma", sa: "Spider angioma" },
    differentials: ["angiokeratoma", "pyogenic_granuloma", "kaposi", "blue_nevus", "melanoma"],
  },
  pyogenic_granuloma: {
    name: "Pyogenic granuloma",
    superclass: "Nonmelanocytic",
    malignancy: "Benign",
    // pg 7 (3)
    codes: ["pg"],
    differentials: ["melanoma", "vascular_lesion", "scc", "bcc", "kaposi"],
    lowCount: true,
  },
  angiokeratoma: {
    name: "Angiokeratoma",
    superclass: "Nonmelanocytic",
    malignancy: "Benign",
    // angk 39 (11)
    codes: ["angk"],
    differentials: ["vascular_lesion", "melanoma", "blue_nevus", "seb_keratosis"],
  },

  // --- Non-melanocytic, premalignant / malignant ---
  bcc: {
    name: "Basal cell carcinoma",
    superclass: "Nonmelanocytic",
    malignancy: "Malignant",
    // bcc 423 (141)
    codes: ["bcc"],
    differentials: ["intradermal_nevus", "seb_keratosis", "melanoma", "scc", "blue_nevus"],
  },
  actinic_keratosis: {
    name: "Actinic keratosis",
    superclass: "Nonmelanocytic",
    malignancy: "Premalignant",
    // ak 58 (22)
    codes: ["ak"],
    differentials: ["scc", "solar_lentigo", "lentigo_maligna", "seb_keratosis"],
  },
  scc: {
    name: "SCC / SCCis (Bowen disease)",
    superclass: "Nonmelanocytic",
    malignancy: "Malignant",
    // scc 266 (90), bd 37 (10) → 303 (97)
    codes: ["scc", "bd"],
    subtypes: { scc: "Squamous cell carcinoma (invasive)", bd: "SCC in situ (Bowen disease)" },
    differentials: ["actinic_keratosis", "bcc", "seb_keratosis", "melanoma", "pyogenic_granuloma"],
  },
  kaposi: {
    name: "Kaposi sarcoma",
    superclass: "Nonmelanocytic",
    malignancy: "Malignant",
    // ks 16 (7)
    codes: ["ks"],
    differentials: ["vascular_lesion", "pyogenic_granuloma", "angiokeratoma", "dermatofibroma", "blue_nevus"],
    lowCount: true,
  },
};

// Source labels deliberately left out of the quiz. 50 images (24 patients).
export const excludedCodes = {
  ls: "Lentigo simplex — reticular pattern is indistinguishable from a small junctional nevus.",
  dfsp: "4 images from 1 patient — too few to learn from.",
  mpd: "9 images from 1 patient — effectively a single case.",
  ch: "Cutaneous horn is a clinical morphology, not a diagnosis (underlying lesion may be SCC, AK, SK or wart).",
};

// The diagnoses available in a mode, with differentials resolved for that mode:
// in advanced mode "nevus" expands to its split children; anything not available
// in the mode (e.g. lichenoid_keratosis in basic) is dropped.
export const diagnosesForMode = (mode) => {
  const advanced = mode === "advanced";
  const included = Object.entries(quizDiagnoses).filter(([, dx]) =>
    advanced ? !dx.advancedSplit : !dx.advancedOnly
  );
  const ids = new Set(included.map(([id]) => id));
  const resolve = (id) => (advanced && quizDiagnoses[id].advancedSplit) || [id];

  return Object.fromEntries(
    included.map(([id, dx]) => [
      id,
      { ...dx, differentials: dx.differentials.flatMap(resolve).filter((d) => ids.has(d) && d !== id) },
    ])
  );
};

// Source code → quiz diagnosis id for a mode, e.g. codeToDx("basic").jd === "nevus".
// Codes absent from the result (excludedCodes, or lk in basic) aren't quizzed.
export const codeToDx = (mode) =>
  Object.fromEntries(
    Object.entries(diagnosesForMode(mode)).flatMap(([dx, { codes }]) => codes.map((code) => [code, dx]))
  );

// Label for the answer reveal: the specific subtype when the group defines one
// (e.g. "SCC in situ (Bowen disease)"), otherwise the quiz answer name.
export const revealLabel = (dxId, code) => {
  const dx = quizDiagnoses[dxId];
  return dx.subtypes?.[code] ?? dx.name;
};

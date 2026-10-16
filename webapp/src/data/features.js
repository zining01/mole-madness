// Dermoscopic feature vocabulary and per-diagnosis feature lists.
//
// Feature names follow the common metaphoric terms from the International
// Dermoscopy Society terminology consensus (Kittler et al., JAAD 2016); the
// `description` gives the descriptive meaning a learner should see.
//
// `annotate`:
//   region — drawn on the image as a shape (a dot, line or area you can point to)
//   global — a whole-lesion property (symmetry, number of colors); shown as a
//            tag in the reveal rather than drawn
// `polarizedOnly`: only visible with polarized dermoscopy, so may be absent from
// non-polarized images even when the lesion has it.
//
// `diagnosisFeatures[dx]` is keyed by quiz diagnosis id (see taxonomy.js):
//   key        — the clues that point to this diagnosis; what to look for first
//   supportive — often present and consistent, but not distinguishing on their own
// The annotation tool can offer key + supportive first for an image's diagnosis,
// with the full vocabulary as a fallback.

export const features = {
  // --- Global organization ---
  symmetric_single_pattern: {
    name: "Symmetric, single pattern",
    category: "Organization",
    annotate: "global",
    description: "Colors and structures are evenly distributed, with one dominant pattern.",
  },
  asymmetric_multicomponent: {
    name: "Asymmetric multicomponent pattern",
    category: "Organization",
    annotate: "global",
    description: "Three or more different structures, distributed unevenly across the lesion.",
  },
  multiple_colors: {
    name: "Multiple colors (≥3)",
    category: "Organization",
    annotate: "global",
    description: "Three or more of light brown, dark brown, black, blue-gray, red and white.",
  },
  starburst_pattern: {
    name: "Starburst pattern",
    category: "Organization",
    annotate: "global",
    description: "Symmetric radial streaks or pseudopods evenly spaced around the whole perimeter.",
  },
  sharp_demarcation: {
    name: "Sharp demarcation",
    category: "Organization",
    annotate: "global",
    description: "The border stops abruptly against normal skin rather than fading out.",
  },
  no_pigment_network: {
    name: "No pigment network",
    category: "Organization",
    annotate: "global",
    description: "No network anywhere in the lesion — a clue toward a non-melanocytic lesion.",
  },

  // --- Network and lines ---
  typical_network: {
    name: "Typical pigment network",
    category: "Network",
    annotate: "region",
    description: "Thin brown lines with regular, evenly sized holes, fading gradually at the edge.",
  },
  atypical_network: {
    name: "Atypical pigment network",
    category: "Network",
    annotate: "region",
    description: "Thick or uneven lines with irregular holes, often ending abruptly at the edge.",
  },
  negative_network: {
    name: "Negative network",
    category: "Network",
    annotate: "region",
    description: "Light serpiginous lines forming meshes around darker brown areas.",
  },
  pseudonetwork: {
    name: "Pseudonetwork",
    category: "Network",
    annotate: "region",
    description: "Diffuse pigment interrupted by round follicular openings, on facial skin.",
  },
  fingerprint_pattern: {
    name: "Fingerprint pattern",
    category: "Network",
    annotate: "region",
    description: "Fine, parallel, curved brown lines like a fingerprint.",
  },
  irregular_streaks: {
    name: "Irregular streaks / pseudopods",
    category: "Lines",
    annotate: "region",
    description: "Radial lines or bulbous projections at only part of the periphery.",
  },

  // --- Dots and globules ---
  regular_globules: {
    name: "Regular dots / globules",
    category: "Dots & globules",
    annotate: "region",
    description: "Round brown structures of similar size and color, evenly distributed.",
  },
  irregular_globules: {
    name: "Irregular dots / globules",
    category: "Dots & globules",
    annotate: "region",
    description: "Dots or globules that vary in size, shape or color, or are unevenly distributed.",
  },
  peripheral_globules: {
    name: "Peripheral rim of globules",
    category: "Dots & globules",
    annotate: "region",
    description: "A ring of brown globules at the edge — usually a growing nevus.",
  },
  cobblestone_pattern: {
    name: "Cobblestone pattern",
    category: "Dots & globules",
    annotate: "region",
    description: "Large, closely packed, angulated globules like paving stones.",
  },
  peppering: {
    name: "Peppering (granularity)",
    category: "Dots & globules",
    annotate: "region",
    description: "Fine blue-gray dots of melanin in dermal melanophages.",
  },

  // --- Structureless areas and colors ---
  structureless_brown: {
    name: "Structureless brown area",
    category: "Structureless",
    annotate: "region",
    description: "Homogeneous light-to-dark brown area without network or globules.",
  },
  central_hyperpigmentation: {
    name: "Central hyperpigmentation",
    category: "Structureless",
    annotate: "region",
    description: "A darker, roughly centered, structureless area within an otherwise organized lesion.",
  },
  irregular_blotch: {
    name: "Irregular blotch",
    category: "Structureless",
    annotate: "region",
    description: "Dark structureless area that is off-center or irregular in shape, obscuring structures.",
  },
  peripheral_brown_structureless: {
    name: "Peripheral brown structureless area",
    category: "Structureless",
    annotate: "region",
    description: "Light brown featureless zone occupying part of the lesion's periphery.",
  },
  blue_white_veil: {
    name: "Blue-white veil",
    category: "Structureless",
    annotate: "region",
    description: "Irregular confluent blue pigment with an overlying white ground-glass haze.",
  },
  regression_structures: {
    name: "Regression structures",
    category: "Structureless",
    annotate: "region",
    description: "White scar-like areas, often with peppering, where pigment has been lost.",
  },
  homogeneous_blue: {
    name: "Homogeneous blue pigmentation",
    category: "Structureless",
    annotate: "region",
    description: "Structureless steel-blue color from melanin deep in the dermis (Tyndall effect).",
  },
  central_white_patch: {
    name: "Central white scar-like patch",
    category: "Structureless",
    annotate: "region",
    description: "Central white structureless area reflecting dermal fibrosis.",
  },
  white_structureless: {
    name: "White structureless areas",
    category: "Structureless",
    annotate: "region",
    description: "Opaque white-yellow areas, often keratin, in keratinizing tumors.",
  },
  pigment_within_scar: {
    name: "Pigment confined to scar",
    category: "Structureless",
    annotate: "region",
    description: "Pigmentation that stays within the boundary of a white scar.",
  },
  red_structureless: {
    name: "Red-purple structureless area",
    category: "Structureless",
    annotate: "region",
    description: "Homogeneous red, red-white or violaceous area without discrete vessels.",
  },
  shiny_white_structures: {
    name: "Shiny white lines / structures",
    category: "Structureless",
    annotate: "region",
    polarizedOnly: true,
    description: "Bright white orthogonal lines or blotches (chrysalis), from altered dermal collagen.",
  },
  rainbow_pattern: {
    name: "Rainbow pattern",
    category: "Structureless",
    annotate: "region",
    polarizedOnly: true,
    description: "Multicolored iridescent areas across the lesion.",
  },
  white_collarette: {
    name: "White collarette",
    category: "Structureless",
    annotate: "region",
    description: "A rim of white scale around the edge of the lesion.",
  },

  // --- Acral patterns ---
  parallel_furrow: {
    name: "Parallel furrow pattern",
    category: "Acral",
    annotate: "region",
    description: "Pigment lines in the thin furrows of acral skin.",
  },
  lattice_pattern: {
    name: "Lattice-like pattern",
    category: "Acral",
    annotate: "region",
    description: "Pigment lines along the furrows plus crossing lines, forming a ladder.",
  },
  fibrillar_pattern: {
    name: "Fibrillar pattern",
    category: "Acral",
    annotate: "region",
    description: "Fine, slanted, parallel filaments, typically on pressure areas of the sole.",
  },
  parallel_ridge: {
    name: "Parallel ridge pattern",
    category: "Acral",
    annotate: "region",
    description: "Pigment on the broad ridges of acral skin (where the eccrine pores sit).",
  },
  irregular_diffuse_pigmentation: {
    name: "Irregular diffuse pigmentation",
    category: "Acral",
    annotate: "region",
    description: "Structureless pigment of varying shades with no consistent furrow or ridge pattern.",
  },

  // --- Facial (follicular) patterns ---
  asymmetric_follicular_openings: {
    name: "Asymmetric pigmented follicular openings",
    category: "Facial",
    annotate: "region",
    description: "Pigment surrounding a follicular opening unevenly, on one side.",
  },
  annular_granular: {
    name: "Annular-granular pattern",
    category: "Facial",
    annotate: "region",
    description: "Gray dots arranged in rings around follicular openings.",
  },
  rhomboidal_structures: {
    name: "Rhomboidal structures",
    category: "Facial",
    annotate: "region",
    description: "Angulated pigmented lines around follicles forming polygons.",
  },
  obliterated_follicles: {
    name: "Obliterated follicular openings",
    category: "Facial",
    annotate: "region",
    description: "Follicular openings filled in by pigment.",
  },

  // --- Hair and follicles ---
  hypertrichosis: {
    name: "Hypertrichosis",
    category: "Hair & follicles",
    annotate: "region",
    description: "Terminal hairs within the lesion, often thicker or darker than surrounding hair.",
  },
  perifollicular_hypopigmentation: {
    name: "Perifollicular hypopigmentation",
    category: "Hair & follicles",
    annotate: "region",
    description: "Pale halos of lighter pigment around hair follicles.",
  },

  // --- Keratin and surface ---
  milia_like_cysts: {
    name: "Milia-like cysts",
    category: "Keratin & surface",
    annotate: "region",
    description: "Round white-yellow dots from intraepidermal keratin cysts.",
  },
  comedo_like_openings: {
    name: "Comedo-like openings",
    category: "Keratin & surface",
    annotate: "region",
    description: "Brown-yellow keratin plugs in surface invaginations.",
  },
  fissures_ridges: {
    name: "Fissures and ridges",
    category: "Keratin & surface",
    annotate: "region",
    description: "Cerebriform (brain-like) pattern of furrows and ridges.",
  },
  moth_eaten_border: {
    name: "Moth-eaten border",
    category: "Keratin & surface",
    annotate: "region",
    description: "Concave, scalloped indentations along the edge.",
  },
  keratin_scale: {
    name: "Surface scale / keratin",
    category: "Keratin & surface",
    annotate: "region",
    description: "White-yellow scale or keratin mass on the surface.",
  },
  white_circles: {
    name: "White circles",
    category: "Keratin & surface",
    annotate: "region",
    description: "White rings around follicular openings, from keratinization.",
  },
  rosettes: {
    name: "Rosettes",
    category: "Keratin & surface",
    annotate: "region",
    polarizedOnly: true,
    description: "Four white dots arranged in a square around a follicle.",
  },
  strawberry_pattern: {
    name: "Strawberry pattern",
    category: "Keratin & surface",
    annotate: "region",
    description: "Red background with prominent follicles plugged by keratin and surrounded by white halos.",
  },
  ulceration: {
    name: "Ulceration / hemorrhagic crust",
    category: "Keratin & surface",
    annotate: "region",
    description: "Red-black or orange areas where the epidermis is lost or covered in blood crust.",
  },

  // --- BCC structures ---
  blue_gray_ovoid_nests: {
    name: "Blue-gray ovoid nests / globules",
    category: "BCC structures",
    annotate: "region",
    description: "Well-defined blue-gray ovoid areas or clustered globules, not connected to a network.",
  },
  leaf_like_areas: {
    name: "Leaf-like areas",
    category: "BCC structures",
    annotate: "region",
    description: "Brown-gray bulbous extensions at the edge, like a leaf.",
  },
  spoke_wheel: {
    name: "Spoke-wheel areas",
    category: "BCC structures",
    annotate: "region",
    description: "Radial projections meeting at a darker central hub.",
  },

  // --- Vessels ---
  arborizing_vessels: {
    name: "Arborizing vessels",
    category: "Vessels",
    annotate: "region",
    description: "Sharply in-focus red vessels branching like a tree.",
  },
  short_fine_telangiectasias: {
    name: "Short fine telangiectasias",
    category: "Vessels",
    annotate: "region",
    description: "Short, thin, minimally branching vessels — typical of superficial BCC.",
  },
  comma_vessels: {
    name: "Comma vessels",
    category: "Vessels",
    annotate: "region",
    description: "Short, slightly curved vessels, seen in intradermal nevi.",
  },
  dotted_vessels: {
    name: "Dotted vessels",
    category: "Vessels",
    annotate: "region",
    description: "Tiny red dots, viewed end-on as capillary loops.",
  },
  glomerular_vessels: {
    name: "Glomerular vessels",
    category: "Vessels",
    annotate: "region",
    description: "Coiled vessels like a renal glomerulus, often clustered.",
  },
  hairpin_vessels: {
    name: "Hairpin vessels",
    category: "Vessels",
    annotate: "region",
    description: "Looped vessels, often with a white halo in keratinizing lesions.",
  },
  polymorphous_vessels: {
    name: "Polymorphous vessels",
    category: "Vessels",
    annotate: "region",
    description: "Two or more vessel types (e.g. dotted plus linear-irregular) in the same lesion.",
  },
  radiating_vessels: {
    name: "Central vessel with radiating branches",
    category: "Vessels",
    annotate: "region",
    description: "A central red point with fine vessels radiating out like spokes.",
  },
  red_lacunae: {
    name: "Red / red-blue lacunae",
    category: "Vessels",
    annotate: "region",
    description: "Sharply demarcated round-to-oval red, red-blue or violaceous areas.",
  },
  dark_lacunae: {
    name: "Dark lacunae",
    category: "Vessels",
    annotate: "region",
    description: "Dark red to black lacunae, often thrombosed.",
  },
  pale_lacunae: {
    name: "Pale / yellowish lacunae",
    category: "Vessels",
    annotate: "region",
    description: "Translucent or pale-yellow lacunae ('frog spawn'), sometimes with hemorrhage.",
  },
  whitish_veil: {
    name: "Whitish veil",
    category: "Vessels",
    annotate: "region",
    description: "Hazy white overlay on dark lacunae, from hyperkeratosis.",
  },
};

const nevus = {
  key: ["symmetric_single_pattern", "typical_network", "regular_globules", "structureless_brown"],
  supportive: ["peripheral_globules"],
};

const congenitalNevus = {
  key: ["regular_globules", "cobblestone_pattern", "structureless_brown"],
  supportive: ["typical_network", "symmetric_single_pattern", "hypertrichosis", "perifollicular_hypopigmentation"],
};

const acralNevus = {
  key: ["parallel_furrow", "lattice_pattern", "fibrillar_pattern"],
  supportive: ["symmetric_single_pattern"],
};

export const diagnosisFeatures = {
  // --- Melanocytic, benign ---
  nevus,
  banal_nevus: nevus,
  dysplastic_nevus: {
    key: ["atypical_network", "central_hyperpigmentation", "peripheral_globules"],
    supportive: ["symmetric_single_pattern", "irregular_globules", "structureless_brown"],
    // From your tip: organized global pattern with atypical local features.
  },
  intradermal_nevus: {
    key: ["comma_vessels", "structureless_brown", "regular_globules"],
    supportive: ["cobblestone_pattern", "no_pigment_network"],
  },
  congenital_nevus: congenitalNevus,
  banal_congenital_nevus: congenitalNevus,
  dysplastic_congenital_nevus: {
    key: ["regular_globules", "structureless_brown", "atypical_network", "central_hyperpigmentation"],
    supportive: ["cobblestone_pattern", "irregular_globules", "hypertrichosis", "perifollicular_hypopigmentation"],
    // Dysplastic vs banal is a histologic call; this is the congenital pattern
    // plus the dysplastic local features.
  },
  acral_nevus: acralNevus,
  banal_acral_nevus: acralNevus,
  dysplastic_acral_nevus: {
    key: ["parallel_furrow", "lattice_pattern", "fibrillar_pattern"],
    supportive: ["irregular_globules", "central_hyperpigmentation"],
    // Same approach as dysplastic congenital nevus: acral pattern plus dysplastic
    // local features.
  },
  blue_nevus: {
    key: ["homogeneous_blue", "symmetric_single_pattern"],
    supportive: ["no_pigment_network"],
  },
  spitz_reed: {
    key: ["starburst_pattern", "central_hyperpigmentation", "regular_globules"],
    supportive: ["dotted_vessels", "negative_network", "symmetric_single_pattern"],
  },
  recurrent_nevus: {
    key: ["pigment_within_scar", "central_white_patch"],
    supportive: ["irregular_globules", "irregular_streaks"],
  },
  solar_lentigo: {
    key: ["fingerprint_pattern", "moth_eaten_border", "sharp_demarcation", "structureless_brown"],
    supportive: ["pseudonetwork", "typical_network"],
    // Ink spot lentigo: dark, net-like reticular pattern — covered by typical_network.
  },

  // --- Melanocytic, malignant ---
  melanoma: {
    key: [
      "asymmetric_multicomponent",
      "multiple_colors",
      "atypical_network",
      "irregular_streaks",
      "irregular_globules",
      "irregular_blotch",
      "blue_white_veil",
      "regression_structures",
    ],
    supportive: [
      "negative_network",
      "shiny_white_structures",
      "peripheral_brown_structureless",
      "peppering",
      "polymorphous_vessels",
    ],
  },
  lentigo_maligna: {
    key: ["asymmetric_follicular_openings", "annular_granular", "rhomboidal_structures", "obliterated_follicles"],
    supportive: ["pseudonetwork", "peppering", "regression_structures", "polymorphous_vessels"],
    // The supportive regression and vessel features lean toward LMM (invasion).
  },
  acral_melanoma: {
    key: ["parallel_ridge", "irregular_diffuse_pigmentation", "asymmetric_multicomponent", "multiple_colors"],
    supportive: ["blue_white_veil", "ulceration", "polymorphous_vessels", "irregular_globules"],
    // Nodular subtype is often structureless blue-black, without a ridge pattern.
  },

  // --- Non-melanocytic, benign ---
  seb_keratosis: {
    key: ["milia_like_cysts", "comedo_like_openings", "fissures_ridges", "sharp_demarcation"],
    supportive: ["hairpin_vessels", "moth_eaten_border", "fingerprint_pattern", "pseudonetwork"],
  },
  lichenoid_keratosis: {
    key: ["peppering"],
    supportive: ["fingerprint_pattern", "moth_eaten_border", "pseudonetwork", "dotted_vessels"],
    // Diffuse or localized granular peppering, with remnants of the solar
    // lentigo / SK it arose from.
  },
  dermatofibroma: {
    key: ["central_white_patch", "typical_network"],
    supportive: ["shiny_white_structures", "dotted_vessels", "symmetric_single_pattern"],
    // typical_network here is the delicate peripheral network.
  },
  vascular_lesion: {
    key: ["red_lacunae", "pale_lacunae", "radiating_vessels"],
    supportive: ["sharp_demarcation", "no_pigment_network"],
    // red_lacunae → hemangioma; pale_lacunae → lymphangioma; radiating_vessels → spider angioma.
  },
  pyogenic_granuloma: {
    key: ["red_structureless", "white_collarette"],
    supportive: ["ulceration", "polymorphous_vessels"],
  },
  angiokeratoma: {
    key: ["dark_lacunae", "whitish_veil"],
    supportive: ["red_lacunae", "ulceration"],
  },

  // --- Non-melanocytic, premalignant / malignant ---
  bcc: {
    key: [
      "arborizing_vessels",
      "blue_gray_ovoid_nests",
      "leaf_like_areas",
      "spoke_wheel",
      "shiny_white_structures",
      "ulceration",
    ],
    supportive: ["short_fine_telangiectasias", "no_pigment_network"],
  },
  actinic_keratosis: {
    key: ["strawberry_pattern", "keratin_scale"],
    supportive: ["rosettes", "white_circles"],
  },
  scc: {
    key: ["glomerular_vessels", "keratin_scale", "white_circles", "white_structureless"],
    supportive: ["dotted_vessels", "hairpin_vessels", "polymorphous_vessels", "ulceration", "rosettes"],
    // Clustered glomerular/dotted vessels with scale → SCCis (Bowen);
    // white circles, keratin and hairpin vessels → invasive SCC.
  },
  kaposi: {
    key: ["red_structureless", "rainbow_pattern"],
    supportive: ["keratin_scale"],
  },
};

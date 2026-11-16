// Pairs of features that learners mix up, each with one sentence on how to tell
// them apart. Used on the feature pages ("Don't confuse with"), as the hard
// wrong answers in practice, and in the feedback when a learner picks the
// look-alike.
//
// These are teaching text: edit the wording freely. `a` and `b` are feature ids
// from features.js; the order within a pair doesn't matter.

export const lookalikePairs = [
  // --- Organization ---
  {
    a: 'symmetric_single_pattern',
    b: 'asymmetric_multicomponent',
    tell: 'Fold the lesion in your mind along two axes at right angles. One pattern that mirrors across both is symmetric; three or more structures scattered unevenly is multicomponent.',
  },
  {
    a: 'starburst_pattern',
    b: 'irregular_streaks',
    tell: 'Follow the edge all the way round. Streaks spaced evenly around the whole circumference make a starburst; streaks on one segment only are irregular.',
  },

  // --- Network and lines ---
  {
    a: 'typical_network',
    b: 'atypical_network',
    tell: 'Compare the lines and holes across the lesion. A typical network is uniform and thins out toward the edge; an atypical one has thick, dark or broken lines, holes of different sizes, and may stop abruptly.',
  },
  {
    a: 'typical_network',
    b: 'pseudonetwork',
    tell: 'A true network is a mesh of brown lines. A pseudonetwork is structureless facial pigment with round holes left by follicular openings: the holes make the pattern, not the lines.',
  },
  {
    a: 'typical_network',
    b: 'fingerprint_pattern',
    tell: 'Network lines cross and enclose holes. Fingerprint lines run side by side and curve together without closing into a mesh.',
  },
  {
    a: 'typical_network',
    b: 'negative_network',
    tell: 'In a pigment network the lines are brown and the holes are pale. In a negative network it is reversed: pale lines around darker islands.',
  },
  {
    a: 'rhomboidal_structures',
    b: 'pseudonetwork',
    tell: 'In a pseudonetwork the pigment between the follicles is even. Rhomboidal structures are darker, angulated lines between the follicles that join into polygons.',
  },
  {
    a: 'rhomboidal_structures',
    b: 'angulated_lines',
    tell: 'Rhomboidal structures form on the face, around follicles. Angulated lines are zig-zag segments on sun-damaged skin off the face and do not close into full polygons.',
  },
  {
    a: 'leaf_like_areas',
    b: 'irregular_streaks',
    tell: 'Leaf-like areas are broad, brown-gray to blue-gray lobes joined at a base, in a lesion with no network. Streaks are thin, brown to black, and run out from the body of a melanocytic lesion.',
  },

  // --- Dots and globules ---
  {
    a: 'regular_globules',
    b: 'irregular_globules',
    tell: 'Judge the group rather than a single globule. Regular globules match in size, shape and color and are evenly spaced; irregular ones differ from each other or gather off-center.',
  },
  {
    a: 'regular_globules',
    b: 'cobblestone_pattern',
    tell: 'Cobblestone globules are large, angulated and packed edge to edge. Ordinary globules are smaller, round, and have background between them.',
  },
  {
    a: 'peripheral_globules',
    b: 'irregular_globules',
    tell: 'A peripheral rim runs around the whole edge with even spacing. Globules collected at one part of the edge only count as irregular.',
  },
  {
    a: 'peppering',
    b: 'irregular_globules',
    tell: 'Peppering is tiny and blue-gray, like dust. Dots and globules from melanocytic nests are larger and brown to black.',
  },
  {
    a: 'peppering',
    b: 'in_focus_dots',
    tell: 'Peppering is fine, grainy and usually lies in an area of regression. In-focus dots are fewer, crisp and well separated.',
  },

  // --- Structureless areas and colors ---
  {
    a: 'central_hyperpigmentation',
    b: 'irregular_blotch',
    tell: 'Look at position and outline. Central hyperpigmentation sits in the middle of a symmetric lesion; an irregular blotch is off-center or has an uneven shape.',
  },
  {
    a: 'structureless_brown',
    b: 'irregular_blotch',
    tell: 'A structureless brown area is light to mid brown and plainly empty. A blotch is dark enough to hide whatever structures lie beneath it.',
  },
  {
    a: 'blue_white_veil',
    b: 'homogeneous_blue',
    tell: 'A veil covers part of a lesion, is irregular in outline and has a white ground-glass haze over the blue. A blue nevus is evenly blue throughout, with nothing else in it.',
  },
  {
    a: 'blue_white_veil',
    b: 'regression_structures',
    tell: 'The veil is blue under a hazy white film, typically over a raised part of the lesion. Regression is flat: white scar-like areas, often with gray peppering.',
  },
  {
    a: 'blue_white_veil',
    b: 'whitish_veil',
    tell: 'The whitish veil of an angiokeratoma is a white haze over dark lacunae, with no blue pigment of its own.',
  },
  {
    a: 'regression_structures',
    b: 'central_white_patch',
    tell: 'The white patch of a dermatofibroma is central, in a symmetric lesion with a fine network around it. Regression is off-center and irregular, often with peppering.',
  },
  {
    a: 'regression_structures',
    b: 'shiny_white_structures',
    tell: 'Shiny white lines are short, bright and straight, often at right angles to each other, and show only under polarized light. Regression is a dull white area rather than lines.',
  },
  {
    a: 'white_structureless',
    b: 'keratin_scale',
    tell: 'Scale lies on top of the lesion: opaque flakes with edges. White structureless areas are part of the lesion itself and have no free edge.',
  },
  {
    a: 'red_structureless',
    b: 'milky_red_areas',
    tell: 'Milky-red areas are pale pink and hazy, like strawberry milk, often with blurred vessels inside. A red structureless area is a deeper, uniform red to violet.',
  },

  // --- Acral ---
  {
    a: 'parallel_furrow',
    b: 'parallel_ridge',
    tell: 'Find the eccrine pores, the rows of white dots: they open on the ridges. Thin lines running between the rows of pores are in the furrows; broad bands that carry the pores are on the ridges.',
  },
  {
    a: 'parallel_furrow',
    b: 'lattice_pattern',
    tell: 'A lattice has the same furrow lines with short crossing lines between them, like the rungs of a ladder.',
  },
  {
    a: 'parallel_furrow',
    b: 'fibrillar_pattern',
    tell: 'Furrow lines follow the skin markings. Fibrillar lines are fine, slanted strokes that cross the skin markings at an angle.',
  },

  // --- Facial ---
  {
    a: 'asymmetric_follicular_openings',
    b: 'annular_granular',
    tell: 'Asymmetric openings have solid pigment hugging one side of the follicle, like a crescent. In the annular-granular pattern, separate gray dots are arranged in a ring around it.',
  },
  {
    a: 'asymmetric_follicular_openings',
    b: 'obliterated_follicles',
    tell: 'With an asymmetric opening, part of the follicle is still visible. An obliterated follicle has been filled in by pigment.',
  },
  {
    a: 'strawberry_pattern',
    b: 'pseudonetwork',
    tell: 'Both spare the follicles on facial skin. The strawberry pattern has a red background and white halos around keratin-plugged follicles; a pseudonetwork has a brown background.',
  },

  // --- Keratin and surface ---
  {
    a: 'milia_like_cysts',
    b: 'comedo_like_openings',
    tell: 'Milia-like cysts are white to yellow and bright: keratin beneath the surface. Comedo-like openings are brown to black plugs sitting in pits: keratin open to the surface.',
  },
  {
    a: 'milia_like_cysts',
    b: 'rosettes',
    tell: 'A rosette is four small white points arranged in a square, seen only under polarized light. Milia-like cysts are single round dots of varying size.',
  },
  {
    a: 'white_circles',
    b: 'rosettes',
    tell: 'A white circle is a ring around a follicle. A rosette is four separate dots, like a four-leaf clover.',
  },
  {
    a: 'ulceration',
    b: 'multiple_small_erosions',
    tell: 'The difference is size and number: one or a few larger crusted areas, against several pinpoint crusts scattered over the lesion.',
  },
  {
    a: 'ulceration',
    b: 'dark_lacunae',
    tell: 'A blood crust sits on the surface, has a jagged outline and no internal structure. Lacunae are rounded, well defined and separated from each other.',
  },

  // --- BCC structures ---
  {
    a: 'blue_gray_ovoid_nests',
    b: 'leaf_like_areas',
    tell: 'Ovoid nests are rounded and lie within the lesion. Leaf-like areas are bulbous lobes joined at a base, usually at the edge.',
  },
  {
    a: 'spoke_wheel',
    b: 'concentric_structures',
    tell: 'A spoke wheel has radial projections around a dark hub. Concentric structures are rounded with a darker center and no spokes.',
  },

  // --- Vessels ---
  {
    a: 'arborizing_vessels',
    b: 'short_fine_telangiectasias',
    tell: 'Arborizing vessels have a thick trunk that divides into finer branches, all in sharp focus. Short fine telangiectasias are thin, short and hardly branch.',
  },
  {
    a: 'arborizing_vessels',
    b: 'comma_vessels',
    tell: 'Comma vessels are short, curved, slightly blurred and do not branch. Arborizing vessels branch repeatedly and stay sharp.',
  },
  {
    a: 'comma_vessels',
    b: 'hairpin_vessels',
    tell: 'A comma vessel is a single short curve. A hairpin is a loop that doubles back on itself, often with a white halo in keratinizing lesions.',
  },
  {
    a: 'dotted_vessels',
    b: 'glomerular_vessels',
    tell: 'Glomerular vessels are larger than dots, coiled when you look closely, and tend to sit in clusters. Dotted vessels are pinpoint and uniform.',
  },
  {
    a: 'red_lacunae',
    b: 'dark_lacunae',
    tell: 'The structure is the same and the color differs: red to red-blue in a hemangioma, dark red to black and often thrombosed in an angiokeratoma.',
  },
  {
    a: 'red_lacunae',
    b: 'pale_lacunae',
    tell: 'The shape is the same and the contents differ: blood makes lacunae red, lymph makes them pale or yellowish.',
  },
  {
    a: 'red_lacunae',
    b: 'milky_red_areas',
    tell: 'Lacunae are sharply outlined and separate from one another. Milky-red areas are hazy, with no clear edge.',
  },
];

const byFeature = {};
for (const { a, b, tell } of lookalikePairs) {
  (byFeature[a] ??= []).push({ id: b, tell });
  (byFeature[b] ??= []).push({ id: a, tell });
}

/** Features commonly confused with this one: [{ id, tell }]. */
export const lookalikesOf = (featureId) => byFeature[featureId] ?? [];

/** The sentence that separates two features, if they are a known pair. */
export const tellApart = (x, y) => byFeature[x]?.find((l) => l.id === y)?.tell ?? null;

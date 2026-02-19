// 'acb': ('Acral Benign Compound Nevus', 'Melanocytic', 'Benign'),
//     'ccb': ('Congenital Benign Compound Nevus', 'Melanocytic', 'Benign'),
//     'mcb': ('Miescher Benign Compound Nevus', 'Melanocytic', 'Benign'),
//     'cb':  ('Benign Compound Nevus', 'Melanocytic', 'Benign'),
//     'bdb': ('Blue Benign Dermal Nevus', 'Melanocytic', 'Benign'),
//     'db':  ('Benign Dermal Nevus', 'Melanocytic', 'Benign'),
//     'ajb': ('Acral Benign Junctional Nevus', 'Melanocytic', 'Benign'),
//     'cjb': ('Congenital Benign Junctional Nevus', 'Melanocytic', 'Benign'),
//     'jb':  ('Benign Junctional Nevus', 'Melanocytic', 'Benign'),
//     'acd': ('Acral Dysplastic Compound Nevus', 'Melanocytic', 'Benign'),
//     'ccd': ('Congenital Dysplastic Compound Nevus', 'Melanocytic', 'Benign'),
//     'cd':  ('Dysplastic Compound Nevus', 'Melanocytic', 'Benign'),
//     'ajd': ('Acral Dysplastic Junctional Nevus', 'Melanocytic', 'Benign'),
//     'srjd': ('Spitz/Reed Dysplastic Junctional', 'Melanocytic', 'Benign'),
//     'jd':  ('Dysplastic Junctional Nevus', 'Melanocytic', 'Benign'),
//     'rd':  ('Dysplastic Recurrent Nevus', 'Melanocytic', 'Benign'),
//     'isl': ('Ink Spot Lentigo', 'Melanocytic', 'Benign'),
//     'ls':  ('Lentigo Simplex', 'Melanocytic', 'Benign'),
//     'sl':  ('Solar Lentigo', 'Melanocytic', 'Benign'),

//     # Melanocytic Malignant
//     'anm': ('Acral Nodular Melanoma', 'Melanocytic', 'Malignant'),
//     'alm': ('Acral Lentiginious Melanoma', 'Melanocytic', 'Malignant'),
//     'lm':  ('Lentigo Maligna', 'Melanocytic', 'Malignant'),
//     'lmm': ('Lentigo Maligna Melanoma', 'Melanocytic', 'Malignant'),
//     'mel': ('Melanoma', 'Melanocytic', 'Malignant'),

//     # Non-melanocytic Benign
//     'sk':   ('Seborrheic Keratosis', 'Nonmelanocytic', 'Benign'),
//     'lk':   ('Lichenoid Keratosis', 'Nonmelanocytic', 'Benign'),
//     'df':   ('Dermatofibroma', 'Nonmelanocytic', 'Benign'),
//     'angk': ('Angiokeratoma', 'Nonmelanocytic', 'Benign'),
//     'ha':   ('Hemangioma', 'Nonmelanocytic', 'Benign'),
//     'la':   ('Lymphangioma', 'Nonmelanocytic', 'Benign'),
//     'pg':   ('Pyogenic Granuloma', 'Nonmelanocytic', 'Benign'),
//     'sa':   ('Spider Angioma', 'Nonmelanocytic', 'Benign'),

//     # Non-melanocytic Indeterminate
//     #Actinic keratosis is technically pre-malignant so it is classified as malignant here, but you could argue for indeterminate if you want to be more conservative
//     'ak':   ('Actinic Keratosis', 'Nonmelanocytic', 'Malignant'),

//     # Non-melanocytic Malignant
//     'bcc':  ('Basal Cell Carcinoma', 'Nonmelanocytic', 'Malignant'),
//     'bd':   ('Bowen\'s Disease', 'Nonmelanocytic', 'Malignant'),
//     'ch':   ('Cutaneous Horn', 'Nonmelanocytic', 'Malignant'),
//     'mpd':  ('Mammary Paget Disease', 'Nonmelanocytic', 'Malignant'),
//     'scc':  ('Squamous Cell Carcinoma', 'Nonmelanocytic', 'Malignant'),
//     'dfsp': ('Dermatofibrosarcoma Protuberans', 'Nonmelanocytic', 'Malignant'),
//     'ks':   ('Kaposi Sarcoma', 'Nonmelanocytic', 'Malignant')

export const findingsLibrary = {
  "Acral Benign Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi are typically symmetric with a single dominant global pattern. The pigment distribution of acral nevi can be influenced by the skin architecture, and classic patterns are the parallel furrow pattern, lattice-like pattern, and fibrillar pattern. However, the key is that these patterns are still symmetric and organized."
  },
  "Congenital Benign Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi typically show a single, symmetric global pattern. Congenital nevi can sometimes have a more complex appearance with a globular pattern, cobblestone pattern with closely packed, 'pebbled' globules, homogenous areas, or hair follicles."
  },
  "Miescher Benign Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi are typically symmetric with a single dominant global pattern. Compound nevi typically have a mixed pattern with a network and globules, but the key is that this combination pattern is still symmetric and organized."
  },
  "Benign Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi are typically symmetric with a single dominant global pattern. Compound nevi typically have a mixed pattern with a network and globules, but the key is that this combination pattern is still symmetric and organized."
  },
  "Blue Benign Dermal Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Blue nevi typically show a single, symmetric global pattern with structureless blue pigmentation. The blue color is due to the Tyndall effect, where melanin located deeper in the dermis appears blue."
  },
  "Benign Dermal Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign dermal nevi are typically symmetric with a single dominant global pattern. They may contain comma (curved) vesses, appear homogenous light brown, have a globular pattern, and lack a pigment network."
  },
  "Acral Benign Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi are typically symmetric with a single dominant global pattern. The pigment distribution of acral nevi can be influenced by the skin architecture, and classic patterns are the parallel furrow pattern, lattice-like pattern, and fibrillar pattern. However, the key is that these patterns are still symmetric and organized."
  },
  "Congenital Benign Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:"Benign nevi typically show a single, symmetric global pattern. Congenital nevi can sometimes have a more complex appearance with a globular pattern, cobblestone pattern with closely packed, 'pebbled' globules, homogenous areas, or hair follicles."
  },
  "Benign Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign junctional nevi are typically symmetric with a single dominant global pattern. They often show a pigment network, which is a honeycomb-like pattern of lines that corresponds to the rete ridges of the epidermis. The holes of the network correspond to the dermal papillae, and the color can range from light brown to dark brown depending on the amount of melanin."
  },
  "Acral Dysplastic Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "The pigment distribution of acral nevi can be influenced by the skin architecture, and classic patterns are the parallel furrow pattern, lattice-like pattern, and fibrillar pattern. Dysplastic nevi often have an overall organized global pattern but atypical local features, such as an irregular network, multiple shades of brown, peripheral globules, or a central darker area."
  },
  "Congenital Dysplastic Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Congenital nevi can sometimes have a more complex appearance with a globular pattern, cobblestone pattern with closely packed, 'pebbled' globules, homogenous areas, or hair follicles. Dysplastic nevi often have an overall organized global pattern but atypical local features, such as an irregular network, multiple shades of brown, peripheral globules, or a central darker area."
  },
  "Dysplastic Compound Nevus": { 
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Compound nevi typically have a mixed pattern with a network and globules. Dysplastic nevi often have an overall organized global pattern but atypical local features, such as an irregular network, multiple shades of brown, peripheral globules, or a central darker area."
  },
  "Acral Dysplastic Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "The pigment distribution of acral nevi can be influenced by the skin architecture, and classic patterns are the parallel furrow pattern, lattice-like pattern, and fibrillar pattern. Dysplastic nevi often have an overall organized global pattern but atypical local features, such as an irregular network, multiple shades of brown, peripheral globules, or a central darker area."
  },
  "Spitz/Reed Dysplastic Junctional": {
    cartoon: "/assets/schematics/reed_spitz_two_step.jpg",
    teachingTip: "A Spitz nevus is a melanocytic nevus that typically occurs in children and adolescents. A Reed nevus is considered a pigmented variant of Spitz that appears very dark brown or black.It ofen shows a starburst pattern with symmetric radial streaks evenly distributed around the entire perimeter with a dark brown or black center. A globular pattern with large brown globules or a homogenous pink pattern (seen in amelanotic Spitz) with dotted vessels on a pink background can also be present.",
  },
  "Dysplastic Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Junctional nevi often show a pigment network, which is a honeycomb-like pattern of lines that corresponds to the rete ridges of the epidermis. The holes of the network correspond to the dermal papillae, and the color can range from light brown to dark brown depending on the amount of melanin. Dysplastic nevi often show a two-step pattern with a benign global pattern but atypical local features."
  },
  "Dysplastic Recurrent Nevus": {
    cartoon: "/assets/schematics/recurrent_nevus_two_step.jpg",
    teachingTip: "When you see a scar with a new pigmented growth on top of it, be concerned for recurrent nevus. Look for the 'tennis racket' pattern of a peripheral rim of globules with a central scar."
  },
  "Ink Spot Lentigo": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip: "Ink spot lentigo is a variant of solar lentigo that typically shows homogenous black pigmentation with an angular jagged edge that is sharply demarcated from the surrounding skin, with a fine net-like reticulated pattern that is evenly distributed."
  },
  "Lentigo Simplex": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip: "Lentigo simplex refers to benign melanocytic hyperplasia and features a uniform brown color, fine reticular pigment network, symmetry, and a delicate and consistent structure (very similar to small junctional nevus but will lack globules and is more uniform)"
  },
  "Solar Lentigo": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip: "Solar lentigo is a sun-induced hyperpigmented macule. Characteristic patterns are fingerprint pattern with curved and swirling fine parallel lines, moth-eaten border (with irregular scalloped edges), pseudonetwork (with pigment around follicular openings), and light to dark brown homogenous pigementation."
  },
"Acral Nodular Melanoma": {
  cartoon: "/assets/schematics/acral_melanoma_two_step.jpg",
  teachingTip: "Acral nodular melanomas typically present as asymmetric, structureless lesions with blue-black or multicolored pigmentation. Ulceration, irregular blotches, and polymorphous vessels may be present. The lesion often lacks a parallel furrow pattern and instead shows chaotic pigmentation on acral skin."
},

"Acral Lentiginous Melanoma": {
  cartoon: "/assets/schematics/acral_melanoma_two_step.jpg",
  teachingTip: "Acral lentiginous melanoma characteristically shows the parallel ridge pattern, with pigmentation accentuating the ridges rather than the furrows of acral skin. Asymmetry, irregular diffuse pigmentation, and multicomponent patterns further support malignancy."
},

"Lentigo Maligna": {
  cartoon: "/assets/schematics/melanoma_two_step.jpg",
  teachingTip: "Lentigo maligna demonstrates asymmetric pigmented follicular openings, rhomboidal structures, annular-granular pattern, and gray dots around follicles on sun-damaged facial skin. Obliteration of follicular openings is a concerning feature."
},

"Lentigo Maligna Melanoma": {
  cartoon: "/assets/schematics/melanoma_two_step.jpg",
  teachingTip: "Lentigo maligna melanoma shows the dermoscopic features of lentigo maligna with additional signs of invasion such as structureless areas, blue-gray pigmentation, atypical vascular patterns, and areas of regression, reflecting progression beyond the epidermis."
},

  "Melanoma": {
    cartoon: "/assets/schematics/melanoma_two_step.jpg",
    teachingTip: "Melanomas are almost always asymmetric with multiple structures in an uneven distribution. Major dematoscopic features include thick lines, a network that fades abruptly, and irregular holes. At the periphery, look for bulbous ends (pseudopods) and uneven projections (contrast this with the symmetric starburs seen in Spitz nevi). Melanomas can also have a blue-white veil, which is an irregular, structureless area of confluent blue pigmentation with an overlying white 'ground-glass' haze that obscures the underlying structures. This corresponds to compact orthokeratosis above a zone of dense melanin in the superficial dermis with associated epidermal atrophy.",
  },
  "Seborrheic Keratosis": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip: "Seborrheic keratoses typically show a single, symmetric global pattern, such as milia-like cysts (which reflect intraepidermal keratin cysts), comedo-like openings (keratin-filled invaginations), fissures and ridges (a cerebriform pattern), sharply demarcated borders, haipin vessels (especially in irritated SKs), a moth-eaten border, or a fingerprint pattern. SKs especially on the face may show a pseudo-network that does not actually correspond to pigment at rete ridges that is superficial and patchy"
  },
  "Lichenoid Keratosis": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip: "Lichenoid keratoses typically show a single, symmetric global pattern."
  },
"Dermatofibroma": {
  cartoon: "/assets/schematics/dermatofibroma_two_step.jpg",
  teachingTip: "Dermatofibromas typically display a symmetric global pattern with a central white scar-like area and a delicate peripheral pigment network. The central area often appears structureless and lighter, reflecting fibrosis, while the network at the edge is fine and regular."
},

"Angiokeratoma": {
  cartoon: "/assets/schematics/angioma_two_step.jpg",
  teachingTip: "Angiokeratomas show multiple well-demarcated, dark red to black lacunae separated by pale septa. The lacunae are sharply defined and may appear thrombosed, giving a dark blue or black coloration."
},

"Hemangioma": { 
  cartoon: "/assets/schematics/angioma_two_step.jpg",
  teachingTip: "Hemangiomas demonstrate multiple red, red-blue, or violaceous lacunae that are round to oval and sharply demarcated. The overall architecture is symmetric and lacks pigment network or keratin structures."
},

"Lymphangioma": {
  cartoon: "/assets/schematics/angioma_two_step.jpg",
  teachingTip: "Lymphangiomas show clustered, translucent or pale-yellow lacunae that may contain hemorrhagic areas. The lacunae often appear less uniformly red than hemangiomas and may resemble 'frog spawn' under dermoscopy."
},

"Pyogenic Granuloma": {
  cartoon: "/assets/schematics/angioma_two_step.jpg",
  teachingTip: "Pyogenic granulomas display a homogeneous red to reddish-white structureless area often surrounded by a white collarette. Vessels may be present but are typically obscured by the dense vascular proliferation."
},

"Spider Angioma": {
  cartoon: "/assets/schematics/angioma_two_step.jpg",
  teachingTip: "Spider angiomas show a central red papule representing a feeding arteriole, with fine, radiating linear vessels extending symmetrically outward like spokes of a wheel."
},

"Actinic Keratosis": {
  cartoon: "/assets/schematics/scc_two_step.jpg",
  teachingTip: "Actinic keratoses often show an erythematous background with prominent follicular openings surrounded by white halos (the 'strawberry pattern'). Surface scale and rosettes may be visible under polarized dermoscopy."
},

"Basal Cell Carcinoma": {
  cartoon: "/assets/schematics/bcc_two_step.jpg",
  teachingTip: "Basal cell carcinomas demonstrate arborizing vessels, shiny white structures, blue-gray ovoid nests, or leaf-like areas. Ulceration and absence of a pigment network are key distinguishing features."
},

"Bowen's Disease": {
  cartoon: "/assets/schematics/scc_two_step.jpg",
  teachingTip: "Bowen’s disease shows clustered glomerular (coiled) vessels on a scaly, erythematous background. The vascular pattern is typically regularly distributed across the lesion."
},

"Cutaneous Horn": {
  cartoon: "/assets/schematics/cutaneous_horn_two_step.jpg",
  teachingTip: "Cutaneous horns appear as dense, conical hyperkeratotic projections. Dermoscopic evaluation of the base is critical to assess for features of actinic keratosis, squamous cell carcinoma, or other underlying pathology."
},

"Mammary Paget Disease": {
  cartoon: "/assets/schematics/mammary_paget_two_step.jpg",
  teachingTip: "Mammary Paget disease presents as an erythematous, scaly plaque with irregular vascular patterns and structureless pink to red areas. Pigmentation may be present but lacks a true melanocytic network."
},

"Squamous Cell Carcinoma": {
  cartoon: "/assets/schematics/scc_two_step.jpg",
  teachingTip: "Squamous cell carcinomas often show keratin scale, white structureless areas, and polymorphous or glomerular vessels on an erythematous background. Ulceration and hemorrhagic crust may be present."
},

"Dermatofibrosarcoma Protuberans": {
  cartoon: "/assets/schematics/dfsp_two_step.jpg",
  teachingTip: "Dermatofibrosarcoma protuberans may show a pink to light-brown structureless background with delicate linear vessels. Pigment network is typically absent, and the lesion may appear well-circumscribed."
},
"Kaposi Sarcoma": {
  cartoon: "/assets/schematics/ks_two_step.jpg",
  teachingTip: "Kaposi sarcoma commonly displays a homogeneous violaceous to red-purple coloration with a structureless pattern. A rainbow pattern may be seen under polarized dermoscopy."
}
};
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
    teachingTip: "Benign nevi typically show a single, symmetric global pattern."
  },
  "Congenital Benign Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi typically show a single, symmetric global pattern."
  },
  "Miescher Benign Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi typically show a single, symmetric global pattern."
  },
  "Benign Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi typically show a single, symmetric global pattern."
  },
  "Blue Benign Dermal Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi typically show a single, symmetric global pattern."
  },
  "Benign Dermal Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi typically show a single, symmetric global pattern."
  },
  "Acral Benign Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi typically show a single, symmetric global pattern."
  },
  "Congenital Benign Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi typically show a single, symmetric global pattern."
  },
  "Benign Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Benign nevi typically show a single, symmetric global pattern."
  },
  "Acral Dysplastic Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Dysplastic nevi often show a two-step pattern with a benign global pattern but atypical local features."
  },
  "Congenital Dysplastic Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Dysplastic nevi often show a two-step pattern with a benign global pattern but atypical local features."
  },
    "Dysplastic Compound Nevus": { 
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Dysplastic nevi often show a two-step pattern with a benign global pattern but atypical local features."
  },
  "Acral Dysplastic Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Dysplastic nevi often show a two-step pattern with a benign global pattern but atypical local features."
  },
  "Spitz/Reed Dysplastic Junctional": {
    cartoon: "/assets/schematics/reed_spitz_two_step.jpg",
    teachingTip: "When you see a tiered peripheral globular pattern or starburst pattern in an individual of older age, this lesion should be viewed with suspicions."
  },
    "Dysplastic Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip: "Dysplastic nevi often show a two-step pattern with a benign global pattern but atypical local features."
  },
  "Dysplastic Recurrent Nevus": {
    cartoon: "/assets/schematics/recurrent_nevus_two_step.jpg",
    teachingTip: "When you see a scar with a new pigmented growth on top of it, be concerned for recurrent nevus. Look for the 'tennis racket' pattern of a peripheral rim of globules with a central scar."
  },
  "Ink Spot Lentigo": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip: "Lentigines typically show a single, symmetric global pattern."
  },
  "Lentigo Simplex": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip: "Lentigines typically show a single, symmetric global pattern."
  },
  "Solar Lentigo": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip: "Lentigines typically show a single, symmetric global pattern."
  },
  "Acral Nodular Melanoma": {
    cartoon: "/assets/schematics/acral_melanoma_two_step.jpg",
    teachingTip: "Nodular melanomas often show a two-step pattern with an atypical global pattern and a local pattern of structureless blue pigmentation."
  },
  "Acral Lentiginious Melanoma": {
    cartoon: "/assets/schematics/acral_melanoma_two_step.jpg",
    teachingTip: "Acral lentiginous melanomas often show a two-step pattern with an atypical global pattern and a local pattern of parallel ridge pattern."
  },
  "Lentigo Maligna": {
    cartoon: "/assets/schematics/melanoma_two_step.jpg",
    teachingTip: "Lentigo maligna typically shows an atypical global pattern with a local pattern of parallel ridge pattern."
  },
    "Lentigo Maligna Melanoma": {
    cartoon: "/assets/schematics/melanoma_two_step.jpg",
    teachingTip: "Lentigo maligna melanoma typically shows an atypical global pattern with a local pattern of parallel ridge pattern."
  },
  "Melanoma": {
    cartoon: "/assets/schematics/melanoma_two_step.jpg",
    teachingTip: "Melanomas often show a two-step pattern with an atypical global pattern and local patterns of atypical network, structureless pigmentation, or irregular globules."
  },
  "Seborrheic Keratosis": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip: "Seborrheic keratoses typically show a single, symmetric global pattern."
  },
  "Lichenoid Keratosis": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip: "Lichenoid keratoses typically show a single, symmetric global pattern."
  },
  "Dermatofibroma": {
    cartoon: "/assets/schematics/dermatofibroma_two_step.jpg",
    teachingTip: "Dermatofibromas typically show a single, symmetric global pattern with a local pattern of a central white scar-like area and peripheral delicate pigment network."
  },
  "Angiokeratoma": {
    cartoon: "/assets/schematics/angioma_two_step.jpg",
    teachingTip: "Angiokeratomas typically show a single, symmetric global pattern with a local pattern of well-demarcated red to dark lacunae."
  },
  "Hemangioma": { 
    cartoon: "/assets/schematics/angioma_two_step.jpg",
    teachingTip: "Hemangiomas typically show a single, symmetric global pattern with a local pattern of well-demarcated red to dark lacunae."
  },
  "Lymphangioma": {
    cartoon: "/assets/schematics/angioma_two_step.jpg",
    teachingTip: "Lymphangiomas typically show a single, symmetric global pattern with a local pattern of well-demarcated red to dark lacunae."
  },
  "Pyogenic Granuloma": {
    cartoon: "/assets/schematics/angioma_two_step.jpg",
    teachingTip: "Pyogenic granulomas typically show a single, symmetric global pattern with a local pattern of well-demarcated red to dark lacunae."
  },
  "Spider Angioma": {
    cartoon: "/assets/schematics/angioma_two_step.jpg",
    teachingTip: "a central, bright red, well-demarcated punctum (or papule) representing an arteriole, with thin, linear radiating vessels extending outwards like spider legs."
    },
    "Actinic Keratosis": {
    cartoon: "/assets/schematics/scc_two_step.jpg",
    teachingTip: "Actinic keratoses typically show an atypical global pattern with a local pattern of scaly surface and sometimes a strawberry pattern of prominent follicular openings surrounded by erythema."
  },
  "Basal Cell Carcinoma": {
    cartoon: "/assets/schematics/bcc_two_step.jpg",
    teachingTip: "Basal cell carcinomas typically show an atypical global pattern with local patterns of arborizing vessels, leaf-like areas, or large blue-gray ovoid nests."
  },
  "Bowen's Disease": {
    cartoon: "/assets/schematics/scc_two_step.jpg",
    teachingTip: "Bowen's disease typically shows an atypical global pattern with a local pattern of scaly surface and glomerular vessels."
    },
    "Cutaneous Horn": {
    cartoon: "/assets/schematics/scc_two_step.jpg",
    teachingTip: "Cutaneous horns typically show an atypical global pattern with a local pattern of a hyperkeratotic horn. The underlying lesion can be benign, premalignant, or malignant, so look carefully for other features that might suggest malignancy such as an irregular base or surrounding erythema."
  },
  "Mammary Paget Disease": {
    cartoon: "/assets/schematics/scc_two_step.jpg",
    teachingTip: "Mammary Paget disease typically shows an atypical global pattern with a local pattern of scaly surface and sometimes a strawberry pattern of prominent follicular openings surrounded by erythema."
  },
  "Squamous Cell Carcinoma": {
    cartoon: "/assets/schematics/scc_two_step.jpg",
    teachingTip: "Squamous cell carcinomas typically show an atypical global pattern with a local pattern of scaly surface and glomerular vessels."
  },
  "Dermatofibrosarcoma Protuberans": {
    cartoon: "/assets/schematics/dfsp_two_step.jpg",
    teachingTip: "Dermatofibrosarcoma protuberans typically shows an atypical global pattern with a local pattern of structureless pigmentation and sometimes a pink background."
  },
  "Kaposi Sarcoma": {
    cartoon: "/assets/schematics/ks_two_step.jpg",
    teachingTip: "Kaposi sarcomas typically show an atypical global pattern with a local pattern of structureless pigmentation and sometimes a pink background."
}
};
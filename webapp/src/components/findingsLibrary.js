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
    teachingTip:
      "Acral skin has ridges, where the eccrine pores open, and furrows between them. In a benign acral nevus the pigment follows the furrows: the parallel furrow pattern, which consists of thin brown lines that may be single, doubled or dotted. Two variants are the lattice-like pattern (furrow lines joined by crossing lines, common on the arch of the foot) and the fibrillar pattern (fine slanted filaments on pressure-bearing parts of the sole). Use the white dots of the eccrine pores to orient yourself: pigment running along the line of pores is on the ridges, and the parallel ridge pattern should raise concern for acral melanoma.",
  },
  "Congenital Benign Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "Congenital nevi often show a globular or cobblestone pattern, a diffuse reticular network or structureless brown areas, and larger lesions can combine several of these. Clues to a congenital origin are terminal hairs, perifollicular hypopigmentation, target-like globules within the holes of the network, and milia-like cysts. Some variation in color is expected in a large lesion, but the pattern should be stable over time. A new nodule or a focal change within an otherwise uniform congenital nevus should be monitored.",
  },
  "Miescher Benign Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "Miescher nevi are dome-shaped, skin-colored to light brown papules, usually on the face. Dermoscopy shows a homogeneous tan background with scattered brown globules, terminal hairs and comma vessels that lose focus slightly toward their ends. A soft lesion that rocks from side to side under contact dermoscopy (the 'wobble sign') is typical of a dermal nevus. The main mimic is nodular BCC, whose arborizing vessels are bright, sharply focused and branch repeatedly, and which may show blue-gray ovoid nests; neither belongs in a dermal nevus.",
  },
  "Benign Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "Compound nevi combine junctional and dermal components, typically as a central zone of brown globules or structureless pigment surrounded by a regular network. Colors stay within one or two shades of brown and the arrangement is symmetric. A peripheral rim of globules means the nevus is enlarging, which is expected in children and young adults; the same pattern appearing in an older adult deserves monitoring. Most people have a signature pattern shared by their nevi, so the lesion that looks different from the rest should be examined closely.",
  },
  "Blue Benign Dermal Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "Blue nevi show homogeneous, structureless steel-blue pigmentation, sometimes with whitish scar-like areas or a few blue-gray globules. The blue comes from melanin deep in the dermis: the overlying tissue scatters short wavelengths back toward the viewer while longer ones are absorbed (the Tyndall effect). Most blue nevi have been present and unchanged for years. A blue lesion that is new or changing in an adult needs a broader differential, since nodular melanoma and cutaneous metastases of melanoma can be homogeneously blue, as can a thrombosed hemangioma or a pigmented BCC.",
  },
  "Benign Dermal Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "Intradermal nevi are raised, soft and often skin-colored or light brown, so pigmented structures are sparse. Look for a homogeneous tan background, a few brown globules, comma vessels (short, slightly curved, not branching) and hairs. Papillomatous lesions have a furrowed, cobblestone surface and may contain milia-like cysts, which invites confusion with seborrheic keratosis. A pigment network is usually absent, because the nevus cells lie in the dermis rather than along the rete ridges.",
  },
  "Acral Benign Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "Acral skin has ridges, where the eccrine pores open, and furrows between them. In a benign acral nevus the pigment follows the furrows: the parallel furrow pattern, thin brown lines that may be single, doubled or dotted. Two variants are the lattice-like pattern (furrow lines joined by crossing lines, common on the arch of the foot) and the fibrillar pattern (fine slanted filaments on pressure-bearing parts of the sole). Use the white dots of the eccrine pores to orient yourself: pigment running along the line of pores is on the ridges, and the parallel ridge pattern should raise concern for acral melanoma.",
  },
  "Congenital Benign Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "Flat congenital nevi usually show a reticular or diffuse brown pattern, often with perifollicular hypopigmentation and terminal hairs, and sometimes with target-like globules in the holes of the network. The pattern is regular and repeats across the lesion even when the lesion is large. Patients and parents can usually confirm that it has been present since early childhood, which is the most helpful piece of history. A focal change within the lesion, rather than overall growth in proportion to the child, is the indication for a closer look.",
  },
  "Benign Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "Junctional nevi are flat and typically show a reticular pattern. The lines of the network are pigmented rete ridges and the holes are the dermal papillae, so a regular network has thin lines and evenly sized holes, and it fades gradually into the surrounding skin. A centered area of homogeneous pigment or of hypopigmentation is common and of no concern. Because patients tend to have many nevi that look alike, a lesion that stands out from the others tells you more than any single feature.",
  },
  "Acral Dysplastic Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "These lesions keep the architecture of acral skin but are less orderly than a banal acral nevus: the furrow lines may vary in thickness or color, the lattice may be incomplete, and there may be focal structureless areas. Banal versus dysplastic is decided on histology, so the practical question at the bedside is nevus versus acral melanoma. Pigment on the ridges, diffuse irregular pigmentation in several shades of brown or gray, and asymmetry favor melanoma. In the three-step algorithm, an acral lesion without a typical benign pattern is biopsied if it measures more than 7 mm and followed if it is smaller.",
  },
  "Congenital Dysplastic Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "A dysplastic congenital nevus shows the usual congenital patterns (globules, cobblestone areas, structureless brown zones, hairs) with focal atypia such as an irregular or thickened network, eccentric hyperpigmentation or globules of uneven size. Dysplasia is a histologic label, and many congenital nevi look heterogeneous without being atypical under the microscope. Serial dermoscopy is helpful: a symmetric, stable lesion can be followed, while a change confined to one part of the lesion is the indication for biopsy.",
  },
  "Dysplastic Compound Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "Dysplastic nevi usually keep an organized overall pattern but show atypical local features: areas of thicker or broken network, multifocal hyper- or hypopigmentation, eccentric dark patches, or globules of uneven size. Two or three shades of brown are common. They differ from melanoma in degree more than in kind, so step back and look at the whole lesion; melanoma tends to show more asymmetry, more colors and melanoma-specific structures such as blue-white areas, regression or pseudopods. In patients with many dysplastic nevi, comparison with their other lesions and digital monitoring are more reliable than judging each lesion on its own.",
  },
  "Acral Dysplastic Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "These lesions keep the architecture of acral skin but are less orderly than a banal acral nevus: the furrow lines may vary in thickness or color, the lattice may be incomplete, and there may be focal structureless areas. Banal versus dysplastic is decided on histology, so the practical question at the bedside is nevus versus acral melanoma. Pigment on the ridges, diffuse irregular pigmentation in several shades of brown or gray, and asymmetry favor melanoma. In the three-step algorithm, an acral lesion without a typical benign pattern is biopsied if it measures more than 7 mm and followed if it is smaller.",
  },
  "Spitz/Reed Dysplastic Junctional": {
    cartoon: "/assets/schematics/reed_spitz_two_step.jpg",
    teachingTip:
      "Spitz and Reed nevi are most common in children and adolescents. The pigmented (Reed) form classically shows a starburst pattern: a dark center with streaks or pseudopods spaced evenly around the entire edge. Other patterns are a globular pattern with a peripheral rim of large brown globules in a growing lesion, and the pink amelanotic form with evenly distributed dotted vessels and white reticular lines. Because spitzoid melanoma can look identical, a new or changing spitzoid lesion after adolescence is generally excised.",
  },
  "Dysplastic Junctional Nevus": {
    cartoon: "/assets/schematics/nevus_two_step.jpg",
    teachingTip:
      "Most dysplastic junctional nevi show a reticular pattern that is broadly symmetric but irregular in places: the network thickens, thins or ends abruptly in one sector, and there may be eccentric or multifocal hyperpigmentation. Colors are usually limited to shades of brown. Apply the two-step approach: confirm that the lesion is melanocytic, then decide whether the atypia is local or affects the whole lesion. Global disorganization, more than three colors or melanoma-specific structures favor excision, while mild local atypia in a patient with similar nevi favors monitoring.",
  },
  "Dysplastic Recurrent Nevus": {
    cartoon: "/assets/schematics/recurrent_nevus_two_step.jpg",
    teachingTip:
      "Recurrent nevi arise in a scar after incomplete removal of a nevus, usually within a few months of the procedure. The pigment sits within the white scar and may form radial lines, irregular globules or a patchy network, which can look alarming in isolation. Features that point instead to recurrent melanoma are pigment extending beyond the edge of the scar, eccentric pigmentation and recurrence more than six months after the procedure. The histology of the original lesion is the most useful piece of information, so check it before deciding.",
  },
  "Ink Spot Lentigo": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip:
      "Ink spot (reticulated black) lentigo is a small, very dark macule on sun-exposed skin, often standing out among lighter solar lentigines. Dermoscopy shows a bold black network of thick lines, sharply cut off at the edge, with no other structures. The color is jet black but even throughout, and the lesion is small and flat. It can look alarming to the naked eye; its monotony under dermoscopy is what reassures.",
  },
  "Lentigo Simplex": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip:
      "Lentigo simplex is a small, evenly pigmented macule that can appear at any age and on any site, including skin without sun damage. Dermoscopy shows a delicate regular brown network or homogeneous light brown pigment without globules. It is hard to distinguish from a small junctional nevus, and the distinction rarely changes management.",
  },
  "Solar Lentigo": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip:
      "Solar lentigines are light to dark brown macules on chronically sun-exposed skin. Typical findings are homogeneous light brown pigment, a fingerprint pattern of fine parallel curved lines, and a sharply demarcated, moth-eaten border. On the face the pigment is interrupted by follicular openings, giving a pseudonetwork. An important differential diagnosis for facial lesions is lentigo maligna: a solar lentigo should be brown only, so gray dots or asymmetric pigmentation around follicles require closer monitoring or biopsy.",
  },
  "Acral Nodular Melanoma": {
    cartoon: "/assets/schematics/acral_melanoma_two_step.jpg",
    teachingTip:
      "Acral nodular melanoma is often partly or completely amelanotic, which is why it is frequently misdiagnosed. Dermoscopy may show structureless blue-black or pink areas, a blue-white veil, milky-red areas, polymorphous vessels and ulceration. When parallel ridge pigmentation is present, it is usually at the edge, where the in situ component remains. Any acral nodule that bleeds or fails to heal should be biopsied, including one that looks like a wart or a pyogenic granuloma.",
  },
  "Acral Lentiginous Melanoma": {
    cartoon: "/assets/schematics/acral_melanoma_two_step.jpg",
    teachingTip:
      "The parallel ridge pattern is the most specific finding: bands of pigment on the ridges, recognizable because the white dots of the eccrine pores lie within them. Other features are irregular diffuse pigmentation in varying shades of brown, gray or black, asymmetry, and multiple components in a larger lesion. The main benign mimic of ridge pigmentation is subcorneal hemorrhage after trauma, which shows red-black globules in a pebble-like arrangement and pares away or grows out. Ridge pigmentation can also be benign in darker skin types.",
  },
  "Lentigo Maligna": {
    cartoon: "/assets/schematics/melanoma_two_step.jpg",
    teachingTip:
      "Lentigo maligna is melanoma in situ on chronically sun-damaged skin, usually the face. Its features follow the hair follicles: asymmetric pigmented follicular openings, gray dots around follicles (the annular-granular pattern), circles within circles, angulated lines and rhomboidal structures, and eventually obliteration of the follicular openings by pigment. Gray is a useful color if seen, since solar lentigines and seborrheic keratoses are brown. Pigmented actinic keratosis and lichenoid keratosis can show similar gray dots; scale and erythema favor AK, but a biopsy is often needed.",
  },
  "Lentigo Maligna Melanoma": {
    cartoon: "/assets/schematics/melanoma_two_step.jpg",
    teachingTip:
      "Lentigo maligna melanoma is the invasive stage. Alongside the follicular features of lentigo maligna, look for blue-gray or blue-white areas, structureless zones in which the follicles have disappeared, atypical vessels and regression. A palpable area or nodule within an otherwise flat lesion suggests invasion. These lesions are large and heterogeneous, so a biopsy should target the most suspicious area rather than a random part of the lesion.",
  },
  "Melanoma": {
    cartoon: "/assets/schematics/melanoma_two_step.jpg",
    teachingTip:
      "Melanoma is usually asymmetric in both structure and color, with several dermoscopic structures distributed unevenly. Melanoma-specific structures include an atypical network (thick, irregular lines that end abruptly), irregular dots and globules, irregular streaks or pseudopods along part of the edge, an off-center blotch, a blue-white veil, regression structures (white scar-like areas with peppering), negative network, shiny white lines and peripheral light brown structureless areas. The blue-white veil is a confluent blue area under a white ground-glass haze, corresponding to heavily pigmented cells in the dermis beneath a compact, thickened stratum corneum. In amelanotic melanoma the vessels help with the diagnosis: dotted and linear irregular vessels together, or milky-red areas.",
  },
  "Seborrheic Keratosis": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip:
      "Seborrheic keratoses are sharply demarcated and look stuck on. The most useful clues are multiple milia-like cysts (white-yellow dots of intraepidermal keratin), comedo-like openings (keratin-filled invaginations), a cerebriform pattern of fissures and ridges, and hairpin vessels, often with a white halo. Flat lesions on the face may show only a fingerprint pattern, a moth-eaten border or a pseudonetwork, which overlap with solar lentigo. Of note, irritated or heavily pigmented SKs can lose these clues and mimic SCC or melanoma.",
  },
  "Lichenoid Keratosis": {
    cartoon: "/assets/schematics/sk_two_step.jpg",
    teachingTip:
      "Lichenoid keratosis is an inflammatory regression of a solar lentigo or seborrheic keratosis. Its typical finding is a granular pattern: fine blue-gray dots of melanin within dermal macrophages, either in patches or spread across the lesion. Remnants of the original lesion at the edge, such as a fingerprint pattern, a moth-eaten border or a pseudonetwork, support the diagnosis. A diffuse granular pattern with no such remnants cannot reliably be told apart from regressing melanoma or lentigo maligna and usually needs a biopsy.",
  },
  "Dermatofibroma": {
    cartoon: "/assets/schematics/dermatofibroma_two_step.jpg",
    teachingTip:
      "Dermatofibromas are firm papules, most often on the legs, that dimple when pinched. The classic pattern is a central white scar-like patch surrounded by a delicate brown network. Variants include ring-like globules at the edge, a central white network, shiny white structures and dotted vessels. Atypical patterns, such as several white patches, a predominantly pink lesion or an irregular network, overlap with melanoma, BCC and DFSP and are an indication for excision.",
  },
  "Angiokeratoma": {
    cartoon: "/assets/schematics/angioma_two_step.jpg",
    teachingTip:
      "Angiokeratomas are dark red to black papules that are often mistaken for melanoma to the naked eye. Dermoscopy shows well-defined dark lacunae, frequently thrombosed and almost black, with a whitish veil from the overlying hyperkeratosis. Peripheral erythema and hemorrhagic crusts are common. The round, sharply defined lacunae separated by pale septa are characteristic.",
  },
  "Hemangioma": {
    cartoon: "/assets/schematics/angioma_two_step.jpg",
    teachingTip:
      "Hemangiomas show round to oval lacunae, red, red-blue or maroon, sharply defined and separated by pale septa, with no melanocytic structures. Cherry angiomas on the trunk are the most common form. A thrombosed hemangioma turns dark blue to black and can look worrying, but the lacunar architecture usually remains visible, often with a rim of red lacunae.",
  },
  "Lymphangioma": {
    cartoon: "/assets/schematics/angioma_two_step.jpg",
    teachingTip:
      "Lymphangioma circumscriptum, a superficial lymphatic malformation, presents as clustered vesicles with a 'frog spawn' appearance. Under dermoscopy the lacunae are pale yellow or translucent, separated by pale septa, and some contain blood. Where blood settles in the lower part of a lacuna it gives a two-toned, hypopyon-like appearance that is characteristic. The mix of red and pale lacunae helps distinguish it from a hemangioma.",
  },
  "Pyogenic Granuloma": {
    cartoon: "/assets/schematics/angioma_two_step.jpg",
    teachingTip:
      "Pyogenic granulomas are rapidly growing, friable red papules. Dermoscopy shows a homogeneous red to red-white structureless area, often with a white collarette at the base and white rail lines crossing the lesion; ulceration is common. Individual vessels are usually indistinct. Amelanotic melanoma, SCC and other tumors can look almost identical, so anything removed as a pyogenic granuloma should be sent for histology.",
  },
  "Spider Angioma": {
    cartoon: "/assets/schematics/angioma_two_step.jpg",
    teachingTip:
      "Spider angiomas consist of a central red dot, the feeding arteriole, with fine linear vessels radiating symmetrically from it. They blanch with pressure and refill from the center. They are common on the face and upper trunk; numerous lesions can accompany liver disease or high-estrogen states such as pregnancy.",
  },
  "Actinic Keratosis": {
    cartoon: "/assets/schematics/scc_two_step.jpg",
    teachingTip:
      "Facial actinic keratoses classically show a strawberry pattern: a red pseudonetwork around follicular openings that are plugged with yellow-white keratin and ringed by white halos. Surface scale is common, and rosettes may be visible with polarized light. Thicker lesions show enlarged keratin-filled follicles on a white-yellow scaly background. Pigmented AKs can show gray dots and asymmetric pigmentation around follicles, overlapping with lentigo maligna; scale and erythema favor AK, but a biopsy may still be needed.",
  },
  "Basal Cell Carcinoma": {
    cartoon: "/assets/schematics/bcc_two_step.jpg",
    teachingTip:
      "BCC usually lacks a pigment network. Its characteristic structures are arborizing vessels (bright red, sharply in focus and branching repeatedly), short fine telangiectasias, ulceration or multiple small erosions, blue-gray ovoid nests and globules, in-focus dots, leaf-like areas, spoke-wheel areas, concentric structures, and shiny white blotches and strands. Superficial BCC tends to show fine telangiectasias, leaf-like areas, small erosions and shiny white areas, whereas nodular BCC shows arborizing vessels and ovoid nests. The main melanocytic mimic is the dermal nevus, whose comma vessels are shorter, curved and less sharply focused.",
  },
  "Bowen's Disease": {
    cartoon: "/assets/schematics/scc_two_step.jpg",
    teachingTip:
      "Bowen disease (SCC in situ) presents as a scaly red plaque. Dermoscopy shows glomerular or dotted vessels, often in clusters, on a pink background with surface scale. Pigmented Bowen disease also shows small brown or gray dots arranged in lines toward the edge, and structureless brown areas. Clustered glomerular vessels with scale is the most useful combination; superficial BCC, the usual differential, shows fine branching telangiectasias instead.",
  },
  "Cutaneous Horn": {
    cartoon: "/assets/schematics/cutaneous_horn_two_step.jpg",
    teachingTip:
      "A cutaneous horn is a clinical description of a projecting mass of keratin, not a diagnosis. The underlying lesion may be an actinic keratosis, SCC, seborrheic keratosis or wart. Dermoscopy of the base is what matters: white circles, white structureless areas and hairpin or irregular vessels around the base suggest SCC.",
  },
  "Mammary Paget Disease": {
    cartoon: "/assets/schematics/mammary_paget_two_step.jpg",
    teachingTip:
      "Mammary Paget disease presents as a red, scaly plaque of the nipple or areola, usually on one side, and is often treated as eczema at first. Dermoscopy shows a pink background with dotted, glomerular or linear vessels, scale and sometimes erosions; pigmented forms may show brown dots or structureless pigment. A unilateral nipple eruption that persists despite treatment should be biopsied.",
  },
  "Squamous Cell Carcinoma": {
    cartoon: "/assets/schematics/scc_two_step.jpg",
    teachingTip:
      "Invasive SCC is usually keratinizing. Look for a central keratin mass or scale, white structureless areas, white circles around follicular openings, blood spots and ulceration, with hairpin or linear irregular vessels, often haloed in white, toward the edge. White circles are among the most helpful clues for separating SCC from both BCC and actinic keratosis. Poorly differentiated SCC produces little keratin and is dominated by red areas and polymorphous vessels, so it can resemble amelanotic melanoma.",
  },
  "Dermatofibrosarcoma Protuberans": {
    cartoon: "/assets/schematics/dfsp_two_step.jpg",
    teachingTip:
      "DFSP is a slow-growing, firm plaque, usually on the trunk, that has often been present for years before diagnosis. Dermoscopy is nonspecific: a pink to light brown structureless background, delicate arborizing or linear vessels and shiny white lines, sometimes with faint network-like brown pigment. Since dermoscopy cannot exclude it, a slowly enlarging indurated plaque should be biopsied, and a 'dermatofibroma' that keeps growing deserves a second look.",
  },
  "Kaposi Sarcoma": {
    cartoon: "/assets/schematics/ks_two_step.jpg",
    teachingTip:
      "Kaposi sarcoma presents as violaceous macules, plaques or nodules, most often on the legs, in older adults or in the setting of immunosuppression. Dermoscopy shows a homogeneous red-purple to bluish structureless area; with polarized light a multicolored rainbow pattern may appear, although it is not specific. Surface scale, small brown globules and a white collarette can also be present. The main differentials are pyogenic granuloma and hemangioma.",
  },
};

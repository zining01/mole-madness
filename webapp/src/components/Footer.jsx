// components/Footer.jsx
import React from 'react';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p className={styles.citations}>
            Yilmaz, A., Yasar, S. P., Gencoglan, G. & Temelkuran, B. DERM12345: A Large, Multisource Dermatoscopic Skin Lesion Dataset with 40 Subclasses. Harvard Dataverse https://doi.org/10.7910/DVN/DAXZ7P (2024). 
        </p>
        <p className={styles.citations}>
            Argenziano et al.: Dermoscopy of pigmented skin lesions: results of a consensus meeting via the Internet. J. Am. Acad. Dermatol. 2003;48:679-93. PMID: 12734496. https://dx.doi.org/10.1067/mjd.2003.281
        </p>
        <p className={styles.creds}>
          VLM analysis performed with <a href='https://ai.google.dev/gemini-api/docs/models/gemini-2.0-flash'>Gemini Flash 2.0</a>.
        </p>
      </div>
    </footer>
  );
}
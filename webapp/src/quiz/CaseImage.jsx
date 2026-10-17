import React, { useState } from 'react';
import { AnnotationShapes } from '../components/AnnotationShapes.jsx';
import styles from './Quiz.module.css';

// The lesion at its own aspect ratio (never cropped), optionally with the
// annotator's highlights drawn over it. `focus` is a feature id to emphasise.
export function CaseImage({ c, showHighlights = false, focus = null }) {
  const [src, setSrc] = useState(c.image || c.src);
  const [size, setSize] = useState(null);
  const shapes = showHighlights ? c.highlights : [];
  const emphasis = focus ? shapes.findIndex((h) => h.feature === focus) : -1;

  return (
    <div className={styles.imageWrap}>
      <img
        src={src}
        alt="Dermoscopic image of the lesion"
        className={styles.image}
        onLoad={(e) => setSize({ src, w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        onError={() => src !== c.src && setSrc(c.src)}
      />
      {size?.src === src && shapes.length > 0 && (
        <svg className={styles.overlay} viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
          <AnnotationShapes highlights={shapes} width={size.w} height={size.h} emphasis={emphasis} />
        </svg>
      )}
    </div>
  );
}

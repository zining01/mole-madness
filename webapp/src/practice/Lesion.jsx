import React, { useEffect, useState } from 'react';
import { featureColor } from '../utils/featureColors.js';
import styles from './Practice.module.css';

const sourceOf = (c) => c.image || c.src;

// Outlines rather than filled dots, so a mark never covers the structure it points at.
function Marks({ marks, w, h }) {
  const unit = Math.max(w, h);
  return marks.map((m, i) => {
    const color = featureColor(m.feature);
    const shape = m.shape === 'ellipse'
      ? { cx: m.cx * w, cy: m.cy * h, rx: m.rx * w, ry: m.ry * h }
      : { cx: m.x * w, cy: m.y * h, rx: unit * 0.055, ry: unit * 0.055 };
    return (
      <g key={i}>
        <ellipse {...shape} fill="none" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="5" vectorEffect="non-scaling-stroke" />
        <ellipse {...shape} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </g>
    );
  });
}

/**
 * A lesion image at its own aspect ratio.
 *   marks — highlights to outline: [{ feature, shape, ... }]
 */
export function Lesion({ c, marks = [] }) {
  const [src, setSrc] = useState(sourceOf(c));
  const [size, setSize] = useState(null);

  return (
    <div className={styles.lesion}>
      <img
        src={src}
        alt="Dermoscopic image of a skin lesion"
        draggable={false}
        onLoad={(e) => setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        onError={() => src !== c.src && setSrc(c.src)}
      />
      {size && marks.length > 0 && (
        <svg viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
          <Marks marks={marks} w={size.w} h={size.h} />
        </svg>
      )}
    </div>
  );
}

/** A magnified square of the image around a highlight. */
export function Loupe({ c, mark, ring = false }) {
  const [img, setImg] = useState(null);

  useEffect(() => {
    let live = true;
    const load = (src, fallback) => {
      const probe = new Image();
      probe.onload = () => live && setImg({ src, w: probe.naturalWidth, h: probe.naturalHeight });
      probe.onerror = () => fallback && load(fallback, null);
      probe.src = src;
    };
    load(sourceOf(c), c.src);
    return () => {
      live = false;
    };
  }, [c]);

  if (!img) return <div className={styles.loupe} />;
  const { w, h } = img;
  const unit = Math.max(w, h);
  const cx = (mark.cx ?? mark.x) * w;
  const cy = (mark.cy ?? mark.y) * h;
  const reach = mark.shape === 'ellipse' ? Math.max(mark.rx * w, mark.ry * h) : unit * 0.055;
  const side = Math.min(Math.max(reach * 2.6, unit * 0.3), Math.min(w, h));
  const x = Math.min(Math.max(cx - side / 2, 0), w - side);
  const y = Math.min(Math.max(cy - side / 2, 0), h - side);
  return (
    <svg className={styles.loupe} viewBox={`${x} ${y} ${side} ${side}`} role="img" aria-label="Magnified view of the marked area">
      <image href={img.src} width={w} height={h} />
      {ring && <Marks marks={[mark]} w={w} h={h} />}
    </svg>
  );
}

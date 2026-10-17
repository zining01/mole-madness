import React from 'react';
import { featureColor } from '../utils/featureColors.js';

// Draws highlights inside an <svg viewBox={`0 0 ${width} ${height}`}>. A highlight
// points at one clear example of a feature, stored as 0–1 fractions of the image size:
//   { feature, shape: 'ellipse', cx, cy, rx, ry } or { feature, shape: 'point', x, y }
// `emphasis` is the index to draw bolder. Pass onShapePointerDown to make shapes
// selectable (the annotation editor); leave it out for a read-only overlay (the quiz reveal).
export function AnnotationShapes({ highlights, width, height, emphasis, onShapePointerDown }) {
  const unit = Math.max(width, height);

  return highlights.map((region, i) => {
    const color = featureColor(region.feature);
    const active = emphasis === i;
    const interactive = Boolean(onShapePointerDown);
    const onPointerDown = interactive ? (e) => onShapePointerDown(e, i) : undefined;

    let shape;
    let labelX;
    let labelY;
    if (region.shape === 'ellipse') {
      const cx = region.cx * width;
      const cy = region.cy * height;
      const rx = region.rx * width;
      const ry = region.ry * height;
      // Only the outline is clickable, so smaller shapes can be drawn inside larger ones.
      shape = (
        <>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="white" strokeOpacity={0.85}
            strokeWidth={active ? 6 : 4} vectorEffect="non-scaling-stroke" pointerEvents="none" />
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} fillOpacity={active ? 0.18 : 0}
            stroke={color} strokeWidth={active ? 3.5 : 2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
          {interactive && (
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="transparent" strokeWidth={14}
              vectorEffect="non-scaling-stroke" pointerEvents="stroke" style={{ cursor: 'pointer' }}
              onPointerDown={onPointerDown} />
          )}
        </>
      );
      labelX = cx + rx * 0.72;
      labelY = cy - ry * 0.72;
    } else {
      const x = region.x * width;
      const y = region.y * height;
      shape = (
        <circle cx={x} cy={y} r={unit * (active ? 0.016 : 0.012)} fill={color} stroke="white"
          strokeWidth={2} vectorEffect="non-scaling-stroke"
          pointerEvents={interactive ? 'all' : 'none'} style={interactive ? { cursor: 'pointer' } : undefined}
          onPointerDown={onPointerDown} />
      );
      labelX = x + unit * 0.018;
      labelY = y - unit * 0.018;
    }

    return (
      <g key={i}>
        {shape}
        <text x={labelX} y={labelY} fontSize={unit * 0.04} fontWeight="700" fill="white"
          stroke="#111827" strokeWidth={unit * 0.006} paintOrder="stroke" pointerEvents="none">
          {i + 1}
        </text>
      </g>
    );
  });
}

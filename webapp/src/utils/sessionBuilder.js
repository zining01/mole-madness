export const generateDeck = (data, settings, fastShuffle) => {
  // 1. Filter by Lesion Type
  let pool = Object.keys(data).filter(id => {
    const item = data[id];
    if (settings.type === 'both') return true;
    return item.lesion_type === settings.type;
  });

  // 2. Separate by Malignancy
  const malignantPool = pool.filter(id => data[id].malignancy === 'Malignant');
  const benignPool = pool.filter(id => data[id].malignancy === 'Benign');

  // 3. Calculate target numbers
  let targetMalignant = Math.round(settings.count * settings.malignantFraction);
  let targetBenign = settings.count - targetMalignant;

  // 4. Handle Edge Cases
  if (targetMalignant > malignantPool.length) {
    targetMalignant = malignantPool.length;
    targetBenign = settings.count - targetMalignant;
    alert(`Only ${malignantPool.length} malignant cases available. Filling the rest with benign.`);
  }

  // 5. Shuffle and Select
  const selectedMalignant = fastShuffle([...malignantPool]).slice(0, targetMalignant);
  const selectedBenign = fastShuffle([...benignPool]).slice(0, targetBenign);

  // 6. Final Shuffle of the combined deck
  return fastShuffle([...selectedMalignant, ...selectedBenign]);
};
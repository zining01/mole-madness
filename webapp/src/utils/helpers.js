// src/utils/helpers.js

/** * Fisher-Yates Shuffle 
 * Defined here so it can be tested and reused across the whole app.
 */
export const fastShuffle = (array) => {
  const newArray = [...array]; // Work on a copy to keep it "pure"
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
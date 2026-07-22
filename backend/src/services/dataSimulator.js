//WE really betting it on these educated randomisations.

const BASELINE_RWF_USD = 1400;
const BASELINE_UNREST_INDEX = 50;
const BASELINE_REGULATORY_BAN_PROBABILITY = 0.02;

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function generateCurrencyDeviation() {
  //Emulate RWF to USD
  const deviationPercent = getRandomArbitrary(-5, 5);
  return deviationPercent;
}

function generateRegulatoryBan() {
  //Emulate regulatory random true/false with 2% probability
  return Math.random() < BASELINE_REGULATORY_BAN_PROBABILITY;
}

function generateCivilUnrestIndex() {
  //Emulate unrest index: baseline ± 20% random
  const index = BASELINE_UNREST_INDEX + getRandomArbitrary(-10, 10);
  return Math.max(0, index);
}

module.exports = {
  generateCurrencyDeviation,
  generateRegulatoryBan,
  generateCivilUnrestIndex,
};
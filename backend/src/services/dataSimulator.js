// Realistic Rwandan inflation: ~12% with occasional spikes >15%
const BASELINE_INFLATION = 12.0;          // % (Rwanda's current inflation)
const INFLATION_VOLATILITY = 2.0;         // standard deviation
const UNREST_BASELINE = 50;               // base index
const UNREST_VOLATILITY = 5;              // small fluctuations
const REGULATORY_BAN_PROBABILITY = 0.005; // 0.5%

function gaussianRandom(mean = 0, stdev = 1) {
  // Box-Muller transform
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  return z * stdev + mean;
}

function generateCurrencyDeviation() {
  //Inflation around 12% with occasional spikes >15%
  let inflation = gaussianRandom(BASELINE_INFLATION, INFLATION_VOLATILITY);
  //Realistic range (5% – 20%)
  inflation = Math.max(5, Math.min(20, inflation));
  return inflation;
}

function generateRegulatoryBan() {
  return Math.random() < REGULATORY_BAN_PROBABILITY;
}

function generateCivilUnrestIndex() {
  let index = UNREST_BASELINE + gaussianRandom(0, UNREST_VOLATILITY);
  return Math.max(0, index);
}

module.exports = {
  generateCurrencyDeviation,
  generateRegulatoryBan,
  generateCivilUnrestIndex,
};
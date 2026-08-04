// Realistic Rwandan inflation: ~12% with occasional spikes >15%
const BASELINE_INFLATION = 12.0;          //% (Rwanda's current inflation)
const INFLATION_VOLATILITY = 2.0;         //standard deviation
const UNREST_BASELINE = 50;               //base index
const UNREST_VOLATILITY = 5;              //small fluctuations
const REGULATORY_BAN_PROBABILITY = 0.005; //0.5%

function gaussianRandom(mean = 0, stdev = 1) {
  //Corrected Box_Muller
  let spare = null;

function gaussianRandom(mean = 0, stdev = 1) {
  // If we already have a generated value from the previous transform pair, return it directly
  if (spare !== null) {
    const value = spare;
    spare = null;
    return value * stdev + mean;
  }
  //Math randoms are necessary because they generate between 0-1 which is used for standard deviation
  //The 0-1 generated creates random point floating number which represents uniform distribution.
  let u = 1 - Math.random();
  let v = Math.random();

  let mag = Math.sqrt(-2.0 * Math.log(u));
  let dir = 2.0 * Math.PI * v;

  //var=ed this sine component (z1) for the call up
  spare = mag * Math.sin(dir);

  //Returning the cosine component (z0) for the current call up
  return (mag * Math.cos(dir)) * stdev + mean;
}
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
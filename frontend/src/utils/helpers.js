import { ethers } from "ethers";

//Everythign was in plain text not wei as it should be and this cause such a disparagement. Crazy.
export function formatWei(value, decimals = 2) {
  if (value === undefined || value === null || value === "") return "0.00";
  try {
    const formatted = ethers.formatUnits(value, 18);
    const num = parseFloat(formatted);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } catch {
    return "0.00";
  }
}


//Convert a human-readable number to wei (BigInt). 
//The human-readable value. will return {bigint} The value in wei.
 
export function parseWei(value) {
  if (!value) return 0n;
  try {
    return ethers.parseUnits(value.toString(), 18);
  } catch {
    return 0n;
  }
}
export const WeightUnits = [
  "mg", // milligrams
  "g", // grams
  "kg", // kilograms
  "oz", // ounces (US are really crazy 😅 https://simple.wikipedia.org/wiki/United_States_customary_units)
] as const;
export const VolumeUnits = [
  "cup", // cups
  "ml", // milliliters
  "cl", // centiliters
  "l", // liters
] as const;
export const Units = [...WeightUnits, ...VolumeUnits] as const;

export type WeightUnitT = (typeof WeightUnits)[number];
export type VolumeUnitT = (typeof VolumeUnits)[number];
export type UnitT = (typeof Units)[number];

export type UnitConverter = (value: number, from: UnitT, to: UnitT) => number;

/**
 * Error thrown when an invalid unit is provided.
 */
export class InvalidUnitError extends Error {
  public invalidUnit: string;
  constructor(unit: string) {
    super(`Invalid unit: ${unit}`);
    this.invalidUnit = unit;
  }
}

/**
 * Error thrown when a conversion is not allowed.
 */
export class ConversionNotAllowedError extends Error {
  public from: UnitT;
  public to: UnitT;
  constructor(from: UnitT, to: UnitT) {
    super(`Cannot convert from ${from} to ${to}`);
    this.from = from;
    this.to = to;
  }
}

/**
 * Validate a unit.
 *
 * @note: typescript does not allow writing assert functions as arrow functions.
 */
export function validateUnitOrReject(unit: string): asserts unit is UnitT {
  if (!Units.includes(unit as UnitT)) {
    throw new InvalidUnitError(unit);
  }
}

export function validateConversionOrReject(from: UnitT, to: UnitT): void {
  // Forbid converting between mass and volume units.
  if (
    WeightUnits.includes(from as WeightUnitT) &&
    VolumeUnits.includes(to as VolumeUnitT)
  ) {
    throw new ConversionNotAllowedError(from, to);
  }
  if (
    VolumeUnits.includes(from as VolumeUnitT) &&
    WeightUnits.includes(to as WeightUnitT)
  ) {
    throw new ConversionNotAllowedError(from, to);
  }
}

/**
 * Convert a value from one unit to another.
 * @param value The value to convert.
 * @param from The unit to convert from.
 * @param to The unit to convert to.
 * @returns  The converted value.
 */
export const convertUnit: UnitConverter = (value, from, to) => {
  validateUnitOrReject(from);
  validateUnitOrReject(to);
  validateConversionOrReject(from, to);
  switch (from) {
    case "mg":
      switch (to as WeightUnitT) {
        case "mg":
          return value;
        case "g":
          return value / 1000;
        case "kg":
          return value / 1000000;
        case "oz":
          return value * 0.000035274;
      }
    case "g":
      switch (to as WeightUnitT) {
        case "mg":
          return value * 1000;
        case "g":
          return value;
        case "kg":
          return value / 1000;
        case "oz":
          return value * 0.035274;
      }
    case "kg":
      switch (to as WeightUnitT) {
        case "mg":
          return value * 1000000;
        case "g":
          return value * 1000;
        case "kg":
          return value;
        case "oz":
          return value * 35.274;
      }
    case "oz":
      switch (to as WeightUnitT) {
        case "mg":
          return value / 0.000035274;
        case "g":
          return value / 0.035274;
        case "kg":
          return value / 35.274;
        case "oz":
          return value;
      }
    case "ml":
      switch (to as VolumeUnitT) {
        case "cup":
          return value / 240;
        case "ml":
          return value;
        case "cl":
          return value / 10;
        case "l":
          return value / 1000;
      }
    case "cl":
      switch (to as VolumeUnitT) {
        case "cup":
          return value / 24;
        case "ml":
          return value * 10;
        case "cl":
          return value;
        case "l":
          return value / 100;
      }
    case "l":
      switch (to as VolumeUnitT) {
        case "cup":
          return value * 4.16667;
        case "ml":
          return value * 1000;
        case "cl":
          return value * 100;
        case "l":
          return value;
      }
    case "cup":
      switch (to as VolumeUnitT) {
        case "cup":
          return value;
        case "ml":
          return value * 240;
        case "cl":
          return value * 24;
        case "l":
          return value * 0.24;
      }
  }
};

import {
  VolumeUnits,
  WeightUnits,
  convertUnit,
  validateUnitOrReject,
} from "./unit";

describe("unit", () => {
  describe("validation", () => {
    it.each(WeightUnits)("should allow weight unit: %s", (unit) => {
      validateUnitOrReject(unit);
    });
    it.each(VolumeUnits)("should allow volume unit: %s", (unit) => {
      validateUnitOrReject(unit);
    });
    it.each(["invalid", ""])("should reject invalid unit: %s", (unit) => {
      expect(() => validateUnitOrReject(unit)).toThrow();
    });
  });
  describe("valid weight conversion", () => {
    describe("kg to weight", () => {
      it("should convert from mg to kg", () => {
        expect(convertUnit(1_000_000, "mg", "kg")).toBe(1);
      });
      it("should convert from g to kg", () => {
        expect(convertUnit(1_000, "g", "kg")).toBe(1);
      });
      it("should convert from kg to kg", () => {
        expect(convertUnit(1, "kg", "kg")).toBe(1);
      });
      it("should convert from oz to kg", () => {
        expect(convertUnit(35.274, "oz", "kg")).toBe(1);
      });
    });
    describe("g to weight", () => {
      it("should convert from mg to g", () => {
        expect(convertUnit(1_000, "mg", "g")).toBe(1);
      });
      it("should convert from g to g", () => {
        expect(convertUnit(1, "g", "g")).toBe(1);
      });
      it("should convert from kg to g", () => {
        expect(convertUnit(1, "kg", "g")).toBe(1_000);
      });
      it("should convert from oz to g", () => {
        expect(convertUnit(0.035274, "oz", "g")).toBe(1);
      });
    });
    describe("mg to weight", () => {
      it("should convert from mg to mg", () => {
        expect(convertUnit(1, "mg", "mg")).toBe(1);
      });
      it("should convert from g to mg", () => {
        expect(convertUnit(1, "g", "mg")).toBe(1_000);
      });
      it("should convert from kg to mg", () => {
        expect(convertUnit(1, "kg", "mg")).toBe(1_000_000);
      });
      it("should convert from oz to mg", () => {
        expect(convertUnit(0.000035274, "oz", "mg")).toBe(1);
      });
    });
    describe("oz to weight", () => {
      it("should convert from mg to oz", () => {
        expect(convertUnit(1, "mg", "oz")).toBe(0.000035274);
      });
      it("should convert from g to oz", () => {
        expect(convertUnit(1, "g", "oz")).toBe(0.035274);
      });
      it("should convert from kg to oz", () => {
        expect(convertUnit(1, "kg", "oz")).toBe(35.274);
      });
      it("should convert from oz to oz", () => {
        expect(convertUnit(1, "oz", "oz")).toBe(1);
      });
    });
  });
  describe("valid volume conversion", () => {
    describe("ml to volume", () => {
      it("should convert from ml to ml", () => {
        expect(convertUnit(1, "ml", "ml")).toEqual(1);
      });
      it("should convert from ml to cl", () => {
        expect(convertUnit(10, "ml", "cl")).toEqual(1);
      });
      it("should convert from ml to l", () => {
        expect(convertUnit(1000, "ml", "l")).toEqual(1);
      });
      it("should convert from ml to cup", () => {
        expect(convertUnit(240, "ml", "cup")).toEqual(1);
      });
    });
    describe("cl to volume", () => {
      it("should convert from cl to ml", () => {
        expect(convertUnit(1, "cl", "ml")).toEqual(10);
      });
      it("should convert from cl to cl", () => {
        expect(convertUnit(1, "cl", "cl")).toEqual(1);
      });
      it("should convert from cl to l", () => {
        expect(convertUnit(100, "cl", "l")).toEqual(1);
      });
      it("should convert from cl to cup", () => {
        expect(convertUnit(24, "cl", "cup")).toEqual(1);
      });
    });
    describe("l to volume", () => {
      it("should convert from l to ml", () => {
        expect(convertUnit(1, "l", "ml")).toEqual(1000);
      });
      it("should convert from l to cl", () => {
        expect(convertUnit(1, "l", "cl")).toEqual(100);
      });
      it("should convert from l to l", () => {
        expect(convertUnit(1, "l", "l")).toEqual(1);
      });
      it("should convert from l to cup", () => {
        expect(convertUnit(1, "l", "cup")).toEqual(4.16667);
      });
    });
    describe("cup to volume", () => {
      it("should convert from cup to ml", () => {
        expect(convertUnit(1, "cup", "ml")).toEqual(240);
      });
      it("should convert from cup to cl", () => {
        expect(convertUnit(1, "cup", "cl")).toEqual(24);
      });
      it("should convert from cup to l", () => {
        expect(convertUnit(1, "cup", "l")).toEqual(0.24);
      });
      it("should convert from cup to cup", () => {
        expect(convertUnit(1, "cup", "cup")).toEqual(1);
      });
    });
  });
  describe.each(WeightUnits)("invalid weight conversion: %s", (unit) => {
    it.each(VolumeUnits)(`should reject converting ${unit} to %s`, (target) => {
      expect(() => convertUnit(1, unit, target)).toThrow();
    });
  });
  describe.each(VolumeUnits)("invalid volume conversion: %s", (unit) => {
    it.each(WeightUnits)(`should reject converting ${unit} to %s`, (target) => {
      expect(() => convertUnit(1, unit, target)).toThrow();
    });
  });
});

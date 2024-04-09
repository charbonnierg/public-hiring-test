import { CreateFoodProductDto } from "./create-foodProduct.dto";

describe("CreateFoodProductDto", () => {
  describe("fromObject", () => {
    it("should return a new instance of CreateFoodProductDto", async () => {
      // Arrange
      const obj = {
        name: "product",
        composition: [
          {
            name: "ingredient",
            quantity: 1,
            unit: "kg",
          },
        ],
      };

      // Act
      const result = await CreateFoodProductDto.fromObject(obj);

      // Assert
      expect(result).toBeInstanceOf(CreateFoodProductDto);
      expect(result).toMatchObject(obj);
    });
    it("should refuse to create a new instance of CreateFoodProductDto if the object is missing a name", async () => {
      // Arrange
      const obj = {
        composition: [
          {
            name: "ingredient",
            quantity: 1,
            unit: "kg",
          },
        ],
      };

      // Act & Assert
      expect.assertions(1);
      await CreateFoodProductDto.fromObject(obj).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              minLength: "name must be longer than or equal to 2 characters",
            },
            property: "name",
          },
        ]);
      });
    });
    it("should refuse to create a new instance of CreateFoodProductDto if the object name is less than 2 characters", async () => {
      // Arrange
      const obj = {
        name: "p",
        composition: [
          {
            name: "ingredient",
            quantity: 1,
            unit: "kg",
          },
        ],
      };

      // Act & Assert
      expect.assertions(1);
      await CreateFoodProductDto.fromObject(obj).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              minLength: "name must be longer than or equal to 2 characters",
            },
            property: "name",
          },
        ]);
      });
    });
    it("should refuse to create a new instance of CreateFoodProductDto if the object is missing a composition", async () => {
      // Arrange
      const obj = {
        name: "product",
      };

      // Act & Assert
      expect.assertions(1);
      await CreateFoodProductDto.fromObject(obj).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              isArray: "composition must be an array",
            },
            property: "composition",
          },
        ]);
      });
    });
    it("should refuse to create a new instance of CreateFoodProductDto if the object composition is not an array", async () => {
      // Arrange
      const obj = {
        name: "product",
        composition: "ingredient",
      };

      // Act & Assert
      expect.assertions(1);
      await CreateFoodProductDto.fromObject(obj).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              isArray: "composition must be an array",
            },
            property: "composition",
          },
        ]);
      });
    });
    it("should refuse to create a new instance of CreateFoodProductDto if the object composition is an empty array", async () => {
      // Arrange
      const obj = {
        name: "product",
        composition: [],
      };

      // Act & Assert
      expect.assertions(1);
      await CreateFoodProductDto.fromObject(obj).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              arrayMinSize: "composition must contain at least 1 elements",
            },
            property: "composition",
          },
        ]);
      });
    });
    it("should refuse to create a new instance of CreateFoodProductDto if one of the composition elements is missing a name", async () => {
      // Arrange
      const obj = {
        name: "product",
        composition: [
          {
            quantity: 1,
            unit: "kg",
          },
        ],
      };

      // Act & Assert
      expect.assertions(1);
      await CreateFoodProductDto.fromObject(obj).catch((err) => {
        expect(err).toMatchObject([
          {
            children: [
              {
                children: [
                  {
                    constraints: {
                      minLength:
                        "name must be longer than or equal to 2 characters",
                    },
                    property: "name",
                  },
                ],
                property: "0",
              },
            ],
            property: "composition",
          },
        ]);
      });
    });
    it("should refuse to create a new instance of CreateFoodProductDto if one of the composition elements name is less than 2 characters", async () => {
      // Arrange
      const obj = {
        name: "product",
        composition: [
          {
            name: "i",
            quantity: 1,
            unit: "kg",
          },
        ],
      };

      // Act & Assert
      expect.assertions(1);
      await CreateFoodProductDto.fromObject(obj).catch((err) => {
        expect(err).toMatchObject([
          {
            children: [
              {
                children: [
                  {
                    constraints: {
                      minLength:
                        "name must be longer than or equal to 2 characters",
                    },
                    property: "name",
                  },
                ],
                property: "0",
              },
            ],
            property: "composition",
          },
        ]);
      });
    });
    it("should refuse to create a new instance of CreateFoodProductDto if one of the composition elements is missing a quantity", async () => {
      // Arrange
      const obj = {
        name: "product",
        composition: [
          {
            name: "ingredient",
            unit: "kg",
          },
        ],
      };

      // Act & Assert
      expect.assertions(1);
      await CreateFoodProductDto.fromObject(obj).catch((err) => {
        expect(err).toMatchObject([
          {
            children: [
              {
                children: [
                  {
                    constraints: {
                      isNumber:
                        "quantity must be a number conforming to the specified constraints",
                    },
                    property: "quantity",
                  },
                ],
                property: "0",
              },
            ],
            property: "composition",
          },
        ]);
      });
    });
  });
});

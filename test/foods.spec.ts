import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

const authenticate = async () => {
  const user = {
    name: "Léo",
    email: "leo@gmail.com",
    password: "123",
  };

  await request(app.server)
    .post("/auth/sign-up")
    .set("Content-Type", "application/json")
    .send(user);

  const signInResponse = await request(app.server)
    .post("/auth/sign-in")
    .set("Content-Type", "application/json")
    .send({
      email: user.email,
      password: user.password,
    });

  return signInResponse.get("set-cookie");
};

const food = {
  name: "Pizza",
  description: "Pizza de lombo com cheddar",
  inDiet: false,
};

describe("food routes", () => {
  it("should be able create new food", async () => {
    const cookies = await authenticate();

    await request(app.server)
      .post("/foods")
      .set("Content-Type", "application/json")
      .set("Cookie", cookies)
      .send(food)
      .expect(201);
  });

  it("should be able list foods", async () => {
    const cookies = await authenticate();

    await request(app.server)
      .post("/foods")
      .set("Content-Type", "application/json")
      .set("Cookie", cookies)
      .send(food);

    const foodsResponse = await request(app.server)
      .get("/foods")
      .set("Cookie", cookies);

    expect(foodsResponse.statusCode).toEqual(200);
    expect(foodsResponse.body).toEqual({
      foods: [
        expect.objectContaining({
          name: food.name,
          description: food.description,
        }),
      ],
    });
  });

  it("should be able list a single food", async () => {
    const cookies = await authenticate();

    await request(app.server)
      .post("/foods")
      .set("Content-Type", "application/json")
      .set("Cookie", cookies)
      .send(food);

    const foodsResponse = await request(app.server)
      .get("/foods")
      .set("Cookie", cookies);
    const firstFood = foodsResponse.body.foods[0];

    const firstFoodResponse = await request(app.server)
      .get(`/foods/${firstFood.id}`)
      .set("Cookie", cookies);

    expect(firstFoodResponse.statusCode).toEqual(200);
    expect(firstFoodResponse.body).toEqual({
      food: expect.objectContaining({
        name: food.name,
        description: food.description,
      }),
    });
  });

  it("should be able update a food", async () => {
    const cookies = await authenticate();

    await request(app.server)
      .post("/foods")
      .set("Content-Type", "application/json")
      .set("Cookie", cookies)
      .send(food);

    const foodsResponse = await request(app.server)
      .get("/foods")
      .set("Cookie", cookies);
    const firstFood = foodsResponse.body.foods[0];

    const updateData = {
      name: "Hamburger",
      description: "X-tudo com bacon e alface",
    };

    const putFoodResponse = await request(app.server)
      .put(`/foods/${firstFood.id}`)
      .set("Content-Type", "application/json")
      .set("Cookie", cookies)
      .send(updateData);

    const updatedFoodResponse = await request(app.server)
      .get(`/foods/${firstFood.id}`)
      .set("Cookie", cookies);

    expect(putFoodResponse.statusCode).toEqual(204);
    expect(updatedFoodResponse.statusCode).toEqual(200);
    expect(updatedFoodResponse.body).toEqual({
      food: expect.objectContaining(updateData),
    });
  });

  it("should be able delete a food", async () => {
    const cookies = await authenticate();

    await request(app.server)
      .post("/foods")
      .set("Content-Type", "application/json")
      .set("Cookie", cookies)
      .send(food);

    const foodsResponse = await request(app.server)
      .get("/foods")
      .set("Cookie", cookies);
    const firstFood = foodsResponse.body.foods[0];

    await request(app.server)
      .del(`/foods/${firstFood.id}`)
      .set("Cookie", cookies)
      .expect(204);

    await request(app.server)
      .get(`/foods/${firstFood.id}`)
      .set("Cookie", cookies)
      .expect(404);
  });

  it("should be able get metrics from user", async () => {
    const cookies = await authenticate();
    const insertFoods = (food: object, length: number) => {
      return Array.from({ length }).map(() => {
        return request(app.server)
          .post("/foods")
          .set("Content-Type", "application/json")
          .set("Cookie", cookies)
          .send(food);
      });
    };
    const foodInDiet = { ...food, inDiet: true };
    const foodNotInDiet = { ...food, inDiet: false };

    await Promise.all(insertFoods(foodInDiet, 2));
    await Promise.all(insertFoods(foodNotInDiet, 1));
    await Promise.all(insertFoods(foodInDiet, 3));
    await Promise.all(insertFoods(foodNotInDiet, 1));
    await Promise.all(insertFoods(foodInDiet, 1));

    const metricsResponse = await request(app.server)
      .get("/foods/metrics")
      .set("Cookie", cookies);

    expect(metricsResponse.statusCode).toEqual(200);
    expect(metricsResponse.body).toEqual({
      totalFoods: 8,
      totalFoodsInDiet: 6,
      totalFoodsNotInDiet: 2,
      bestInDietSequence: 3,
    });
  });
});

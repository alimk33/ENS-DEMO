import request from "supertest";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { app } from "../src/app.js";
import {
  connectDatabase,
  disconnectDatabase,
  getDatabase,
} from "../src/database/mongodb.js";
import { createNameIndexes } from "../src/repositories/name.repository.js";

beforeAll(async () => {
  await connectDatabase();
  await createNameIndexes();
});

beforeEach(async () => {
  await getDatabase()
    .collection("names")
    .deleteMany({});
});

afterAll(async () => {
  await disconnectDatabase();
});

describe("SEP Name Service", () => {
  it("registers a name", async () => {
    const response = await request(app)
      .post("/api/v1/names")
      .send({
        userId: "user-001",
        username: "usama66",
        walletAddress:
          "0x1111111111111111111111111111111111111111",
        network: "sep-testnet",
      });

    expect(response.status).toBe(201);

    expect(response.body.data.username).toBe(
      "usama66",
    );

    expect(response.body.data.fullName).toBe(
      "usama66.sep",
    );
  });

  it("reverse resolves wallet to username", async () => {
  await request(app)
    .post("/api/v1/names")
    .send({
      userId: "user-001",
      username: "usama66",
      walletAddress:
        "0x1111111111111111111111111111111111111111",
      network: "sep-testnet",
    });

  const response = await request(app).get(
    "/api/v1/names/reverse/0x1111111111111111111111111111111111111111",
  );

  expect(response.status).toBe(200);
  expect(response.body.data.username).toBe("usama66");
});

it("searches usernames", async () => {
  await request(app)
    .post("/api/v1/names")
    .send({
      userId: "user-001",
      username: "usama66",
      walletAddress:
        "0x1111111111111111111111111111111111111111",
      network: "sep-testnet",
    });

  const response = await request(app).get(
    "/api/v1/names/search?q=@usa",
  );

  expect(response.status).toBe(200);
  expect(response.body.data).toHaveLength(1);
  expect(response.body.data[0].username).toBe("usama66");
});

it("prevents one user from registering multiple names", async () => {
  await request(app)
    .post("/api/v1/names")
    .send({
      userId: "user-001",
      username: "usama66",
      walletAddress:
        "0x1111111111111111111111111111111111111111",
      network: "sep-testnet",
    });

  const response = await request(app)
    .post("/api/v1/names")
    .send({
      userId: "user-001",
      username: "ali101",
      walletAddress:
        "0x2222222222222222222222222222222222222222",
      network: "sep-testnet",
    });

  expect(response.status).toBe(409);
  expect(response.body.error).toBe(
    "USER_ALREADY_HAS_NAME",
  );
});

it("changes a username and releases the old name", async () => {
  await request(app)
    .post("/api/v1/names")
    .send({
      userId: "user-001",
      username: "usama66",
      walletAddress:
        "0x1111111111111111111111111111111111111111",
      network: "sep-testnet",
    });

  const changeResponse = await request(app)
    .patch("/api/v1/names/user/user-001")
    .send({
      username: "usama77",
    });

  expect(changeResponse.status).toBe(200);
  expect(changeResponse.body.data.username).toBe(
    "usama77",
  );

  const oldName = await request(app).get(
    "/api/v1/names/availability/usama66",
  );

  expect(oldName.body.data.available).toBe(true);

  const newName = await request(app).get(
    "/api/v1/names/availability/usama77",
  );

  expect(newName.body.data.available).toBe(false);
});

it("rejects reserved usernames", async () => {
  const response = await request(app)
    .post("/api/v1/names")
    .send({
      userId: "user-001",
      username: "admin",
      walletAddress:
        "0x1111111111111111111111111111111111111111",
      network: "sep-testnet",
    });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe("RESERVED_NAME");
});

it("rejects invalid wallet addresses", async () => {
  const response = await request(app)
    .post("/api/v1/names")
    .send({
      userId: "user-001",
      username: "usama66",
      walletAddress: "not-a-wallet",
      network: "sep-testnet",
    });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe("INVALID_WALLET");
});

it("removes a username", async () => {
  await request(app)
    .post("/api/v1/names")
    .send({
      userId: "user-001",
      username: "usama66",
      walletAddress:
        "0x1111111111111111111111111111111111111111",
      network: "sep-testnet",
    });

  const deleteResponse = await request(app).delete(
    "/api/v1/names/user/user-001",
  );

  expect(deleteResponse.status).toBe(204);

  const availabilityResponse = await request(app).get(
    "/api/v1/names/availability/usama66",
  );

  expect(
    availabilityResponse.body.data.available,
  ).toBe(true);
});

  it("resolves username to wallet", async () => {
    await request(app)
      .post("/api/v1/names")
      .send({
        userId: "user-001",
        username: "usama66",
        walletAddress:
          "0x1111111111111111111111111111111111111111",
        network: "sep-testnet",
      });

    const response = await request(app).get(
      "/api/v1/names/resolve/usama66",
    );

    expect(response.status).toBe(200);

    expect(response.body.data.walletAddress).toBe(
      "0x1111111111111111111111111111111111111111",
    );
  });

  it("prevents duplicate usernames", async () => {
    await request(app)
      .post("/api/v1/names")
      .send({
        userId: "user-001",
        username: "usama66",
        walletAddress:
          "0x1111111111111111111111111111111111111111",
        network: "sep-testnet",
      });

    const response = await request(app)
      .post("/api/v1/names")
      .send({
        userId: "user-002",
        username: "usama66",
        walletAddress:
          "0x2222222222222222222222222222222222222222",
        network: "sep-testnet",
      });

    expect(response.status).toBe(409);

    expect(response.body.error).toBe(
      "NAME_ALREADY_TAKEN",
    );
  });

  it("prevents duplicate wallets", async () => {
    await request(app)
      .post("/api/v1/names")
      .send({
        userId: "user-001",
        username: "usama66",
        walletAddress:
          "0x1111111111111111111111111111111111111111",
        network: "sep-testnet",
      });

    const response = await request(app)
      .post("/api/v1/names")
      .send({
        userId: "user-002",
        username: "ali101",
        walletAddress:
          "0x1111111111111111111111111111111111111111",
        network: "sep-testnet",
      });

    expect(response.status).toBe(409);

    expect(response.body.error).toBe(
      "WALLET_ALREADY_HAS_NAME",
    );
  });

  it("checks name availability", async () => {
    const response = await request(app).get(
      "/api/v1/names/availability/ali999",
    );

    expect(response.status).toBe(200);

    expect(response.body.data.available).toBe(true);
  });
});
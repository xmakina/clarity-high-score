import {
  Client,
  Provider,
  ProviderRegistry,
  Result,
} from "@blockstack/clarity";
import { assert } from "chai";

const unwrapTuple = function(tuple){
  const nameMatch = tuple.match(/name 0x(\w+)/)[1];
  const name = Buffer.from(nameMatch, "hex").toString();
  const scoreMatch = tuple.match(/score\s(\d+)/)[1];
  const score = parseInt(scoreMatch);
  return {name, score};
}

const getHighScore = async (client: Client) => {
  const query = client.createQuery({
    method: { name: "get-high-score", args: [] },
  });
  const receipt = await client.submitQuery(query);
  const result = Result.unwrap(receipt);
  const tuple = unwrapTuple(result);
  return tuple;
};

const getMyScore = async (client: Client) => {
  const query = client.createQuery({
    method: { name: "get-my-score", args: [] },
  });
  const receipt = await client.submitQuery(query);
  const result = Result.unwrap(receipt);
  return result;
};

const execMethod = async (client: Client, signature: string, method: string, args: string[]) => {
  const tx = client.createTransaction({
    method: {
      name: method,
      args: args,
    },
  });
  await tx.sign(signature);
  const receipt = await client.submitTransaction(tx);
  return receipt;
};

describe("high score contract test suite", () => {
  const gameSignature = "SP1FXTNRCXQW7CNKKRXZQZPZPKKVPAZS6JYX25YP5";
  const playerOneSignature = "SP2AYGM74FNMJT9M197EJSB49P88NRH0ES1KZD1BX";
  const playerTwoSignature = "SP3T8WFCWHZNQ97SBYQH8T6ZJ1VWDMD46Y3VZ3JNJ";
  
  let gameClient: Client;
  let playerOneClient: Client;
  let playerTwoClient: Client;
  let provider: Provider;
  
  before(async () => {
    provider = await ProviderRegistry.createProvider();
    gameClient = new Client(gameSignature + ".high-score", "high-score", provider);
    playerOneClient = new Client(playerOneSignature + ".high-score", "high-score", provider);
    playerTwoClient = new Client(playerTwoSignature + ".high-score", "high-score", provider);
  });

  it("should have a valid syntax", async () => {
    await gameClient.checkContract();
  });

  describe("deploying an instance of the contract", () => {
    before(async () => {
      await gameClient.deployContract();
    });

    it("starting high score is zero", async () => {
      const topScore = await getHighScore(gameClient);
      assert.equal(topScore.score, 0)
      assert.equal(topScore.name, "nobody")
    });    
  });
  after(async () => {
    await provider.close();
  });
});

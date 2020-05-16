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

const getBestFor = async (client: Client, signature: string) => {
  const query = client.createQuery({
    method: { name: "get-best-for", args: ["'" + signature] },
  });
  const receipt = await client.submitQuery(query);
  const result = Result.unwrap(receipt);
  const tuple = unwrapTuple(result);
  return tuple;
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
    playerOneClient = new Client(gameSignature + ".high-score", "high-score", provider);
    playerTwoClient = new Client(gameSignature + ".high-score", "high-score", provider);
  });

  it("should have a valid syntax", async () => {
    await gameClient.checkContract();
  });

  describe("deploying an instance of the contract", () => {
    before(async () => {
      await gameClient.deployContract();
    });

    it("starting high score is zero", async () => {
      const highScore = await getHighScore(gameClient);
      assert.equal(highScore.score, 0)
      assert.equal(highScore.name, "nobody")
    });

    describe("players can submit a score", async () => {
      describe("when it is the first score submitted", async () => {
        it("adds the player entry", async () => {
          const submission = await execMethod(playerOneClient, playerOneSignature, "submit-score", ["\"alice\"", "50"]);
          assert.equal(submission.success, true);
  
          const bestScore = await getBestFor(playerOneClient, playerOneSignature);
          assert.equal(bestScore.score, 50);
          assert.equal(bestScore.name, "alice");
        })

        it("updates the high score", async () => {
          const highScore = await getHighScore(playerOneClient);
          assert.equal(highScore.score, 50);
          assert.equal(highScore.name, "alice");
        })

        describe("when more scores are added", async () => {
          it("does not update if a lower score is submittted", async() => {
            const submission = await execMethod(playerOneClient, playerOneSignature, "submit-score", ["\"alice\"", "25"]);
            assert.equal(submission.success, true);
    
            const bestScore = await getBestFor(playerOneClient, playerOneSignature);
            assert.equal(bestScore.score, 50);
            assert.equal(bestScore.name, "alice");

            const highScore = await getHighScore(playerOneClient);
            assert.equal(highScore.score, 50);
            assert.equal(highScore.name, "alice");
          })
    
          it("does update if a higher score is submittted", async() => {
            await execMethod(playerOneClient, playerOneSignature, "submit-score", ["\"alice\"", "100"]);
            await execMethod(playerTwoClient, playerTwoSignature, "submit-score", ["\"bob\"", "200"]);
                
            const aliceBestScore = await getBestFor(playerOneClient, playerOneSignature);
            assert.equal(aliceBestScore.score, 100);
            assert.equal(aliceBestScore.name, "alice");
            
            const highScore = await getHighScore(playerOneClient);
            assert.equal(highScore.score, 200);
            assert.equal(highScore.name, "bob");
          })

          it("updates the name when a high score is submitted", async () => {
            await execMethod(playerTwoClient, playerTwoSignature, "submit-score", ["\"brenda\"", "200"]);

            const highScore = await getHighScore(playerOneClient);
            assert.equal(highScore.score, 200);
            assert.equal(highScore.name, "brenda");
          })
        })
      })
    })
  });
  after(async () => {
    await provider.close();
  });
});

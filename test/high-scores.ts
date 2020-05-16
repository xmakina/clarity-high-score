import {
  Client,
  Provider,
  ProviderRegistry,
  Receipt,
} from "@blockstack/clarity";
import { assert } from "chai";
import { ScoreBoardRow, getHighScore, getBestFor, execMethod } from "./helper-functions"

describe("high score contract test suite", () => {
  const gameSignature = "SP1FXTNRCXQW7CNKKRXZQZPZPKKVPAZS6JYX25YP5";
  const playerOneSignature = "SP2AYGM74FNMJT9M197EJSB49P88NRH0ES1KZD1BX";
  const playerTwoSignature = "SP3T8WFCWHZNQ97SBYQH8T6ZJ1VWDMD46Y3VZ3JNJ";

  let provider: Provider;
  let client: Client;

  before(async () => {
    provider = await ProviderRegistry.createProvider();
    client = new Client(gameSignature + ".high-score", "high-score", provider);
  });

  it("has a valid syntax", async () => {
    await client.checkContract();
    await client.deployContract();
  });

  describe("when the contract is new", () => {
    let highScore: ScoreBoardRow;

    before(async () => {
      highScore = await getHighScore(client);
    })

    it("has a starting high score of zero", async () => {
      assert.equal(highScore.score, 0)
    });

    it("has a starting name of nobody", async () => {
      assert.equal(highScore.name, "nobody")
    });
  });

  describe("when player one submits a score of 50 with the name alice", () => {
    it("completes the execution", async () => {
      const submission = await execMethod(client, playerOneSignature, "submit-score", ["\"alice\"", "50"]);
      assert.equal(submission.success, true);
    })

    describe("when getting player one's best score", () => {
      let bestScore: ScoreBoardRow;
      before(async () => {
        bestScore = await getBestFor(client, playerOneSignature);
      })
      it("is 50", () => {
        assert.equal(bestScore.score, 50);
      })
      it("is using the name alice", () => {
        assert.equal(bestScore.name, "alice");
      })
    })

    describe("when getting current high score", () => {
      let highScore: ScoreBoardRow;
      before(async () => {
        highScore = await getHighScore(client);
      })
      it("is 50", () => {
        assert.equal(highScore.score, 50);
      })
      it("belongs to alice", () => {
        assert.equal(highScore.name, "alice");
      })
    })

    describe("when player one submits a lower score", () => {
      let submission: Receipt;
      before(async () => {
        submission = await execMethod(client, playerOneSignature, "submit-score", ["\"alice\"", "25"]);
      })

      it("completes the execution", async () => {
        assert.equal(submission.success, true);
      })

      describe("when getting player one's best score", () => {
        let bestScore: ScoreBoardRow;
        before(async () => {
          bestScore = await getBestFor(client, playerOneSignature);
        })
        it("is still 50", () => {
          assert.equal(bestScore.score, 50);
        })
      })
    })
  })

  describe("when more scores are added", () => {
    describe("when player two submits an identical high score with the name bob", () => {
      it("completes the execution", async () => {
        const submission = await execMethod(client, playerTwoSignature, "submit-score", ["\"bob\"", "50"]);
        assert.equal(submission.success, true);
      })

      describe("when getting player two's best score", () => {
        let bestScore: ScoreBoardRow;
        before(async () => {
          bestScore = await getBestFor(client, playerTwoSignature);
        })
        it("is 50", () => {
          assert.equal(bestScore.score, 50);
        })
        it("is using the name bob", () => {
          assert.equal(bestScore.name, "bob");
        })
      })

      describe("when getting current high score", () => {
        let highScore: ScoreBoardRow;
        before(async () => {
          highScore = await getHighScore(client);
        })
        it("is 50", () => {
          assert.equal(highScore.score, 50);
        })
        it("belongs to alice", () => {
          assert.equal(highScore.name, "alice");
        })
      })
    })

    describe("when player two submits a better high score with the name bob", () => {
      it("completes the execution", async () => {
        const submission = await execMethod(client, playerTwoSignature, "submit-score", ["\"bob\"", "100"]);
        assert.equal(submission.success, true);
      })

      describe("when getting player two's best score", () => {
        let bestScore: ScoreBoardRow;
        before(async () => {
          bestScore = await getBestFor(client, playerTwoSignature);
        })
        it("is 100", () => {
          assert.equal(bestScore.score, 100);
        })
        it("is using the name bob", () => {
          assert.equal(bestScore.name, "bob");
        })
      })

      describe("when getting current high score", () => {
        let highScore: ScoreBoardRow;
        before(async () => {
          highScore = await getHighScore(client);
        })
        it("is 100", () => {
          assert.equal(highScore.score, 100);
        })
        it("belongs to bob", () => {
          assert.equal(highScore.name, "bob");
        })
      })
    })
  })

  describe("when player two changes their name to brenda", () => {
    it("completes the execution", async () => {
      const submission = await execMethod(client, playerTwoSignature, "change-name", ["\"brenda\""]);
      assert.equal(submission.success, true);
    })

    describe("when getting player two's best score", () => {
      let bestScore: ScoreBoardRow;
      before(async () => {
        bestScore = await getBestFor(client, playerTwoSignature);
      })
      it("is 100", () => {
        assert.equal(bestScore.score, 100);
      })
      it("is using the name brenda", () => {
        assert.equal(bestScore.name, "brenda");
      })
    })

    describe("when getting current high score", () => {
      let highScore: ScoreBoardRow;
      before(async () => {
        highScore = await getHighScore(client);
      })
      it("is 100", () => {
        assert.equal(highScore.score, 100);
      })
      it("belongs to brenda", () => {
        assert.equal(highScore.name, "brenda");
      })
    })
  })

  after(async () => {
    await provider.close();
  });
});

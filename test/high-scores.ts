import {
  Client,
  Provider,
  ProviderRegistry,
  Result,
} from "@blockstack/clarity";
import { assert } from "chai";
describe("high score contract test suite", () => {
  let highScoreClient: Client;
  let provider: Provider;
  before(async () => {
    provider = await ProviderRegistry.createProvider();
    highScoreClient = new Client(
      "ST3WCQ6S0DFT7YHF53M8JPKGDS1N1GSSR91677XF1.high-score",
      "high-score",
      provider
    );
  });
  it("should have a valid syntax", async () => {
    await highScoreClient.checkContract();
  });
  describe("deploying an instance of the contract", () => {
    const getscore = async () => {
      const query = highScoreClient.createQuery({
        method: { name: "get-score", args: [] },
      });
      const receipt = await highScoreClient.submitQuery(query);
      const result = Result.unwrapInt(receipt);
      return result;
    };
    const execMethod = async (method: string, args: string[]) => {
      const tx = highScoreClient.createTransaction({
        method: {
          name: method,
          args: args,
        },
      });
      await tx.sign("ST3WCQ6S0DFT7YHF53M8JPKGDS1N1GSSR91677XF1");
      const receipt = await highScoreClient.submitTransaction(tx);
      return receipt;
    };

    before(async () => {
      await highScoreClient.deployContract();
    });
    it("should have a starting score", async () => {
      const score = await getscore();
      assert.equal(25, score);
    });

    describe("submitting high score", () => {
      it("should allow new score", async () => {
        const receipt = await execMethod("submit-score", ["100"]);
        assert.isTrue(receipt.success);
      });
      it("should record the new score", async () => {
        const score = await getscore();
        assert.equal(score, 100);
      });
    });

    describe("submitting a low score", () => {
      it("should allow the submission", async () => {
        const receipt = await execMethod("submit-score", ["50"]);
        assert.isTrue(receipt.success);
      });
      it("should still return the original high score", async () => {
        const score = await getscore();
        assert.equal(score, 100);
      });
    });
  });
  after(async () => {
    await provider.close();
  });
});

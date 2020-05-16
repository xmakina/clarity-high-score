import {
    Client,
    Result,
    Receipt,
} from "@blockstack/clarity";

interface ScoreBoardRow { score: number; name: string; }

function unwrapTuple(tuple: string): ScoreBoardRow {
    const nameMatch = tuple.match(/name 0x(\w+)/)[1];
    const name = Buffer.from(nameMatch, "hex").toString();
    const scoreMatch = tuple.match(/score\s(\d+)/)[1];
    const score = parseInt(scoreMatch);
    return { name, score };
}

async function scoreBoardQuery(client: Client, name: string, args: string[]): Promise<ScoreBoardRow> {
    const query = client.createQuery({
        method: { name, args },
    });
    const receipt = await client.submitQuery(query);
    const result = Result.unwrap(receipt);
    const tuple = unwrapTuple(result);
    return tuple;
}

async function getHighScore(client: Client): Promise<ScoreBoardRow> {
    return await scoreBoardQuery(client, "get-high-score", []);
};

async function getBestFor(client: Client, signature: string): Promise<ScoreBoardRow> {
    return await scoreBoardQuery(client, "get-best-for", ["'" + signature]); // The apostrophe is needed to turn the signature string literal into a principal
};

async function execMethod(client: Client, signature: string, method: string, args: string[]): Promise<Receipt> {
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

export {ScoreBoardRow, getHighScore, getBestFor, execMethod}

//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const { expect } = require("chai");
const buildPoseidon = require("circomlibjs").buildPoseidon;
const wasm_tester = require("circom_tester").wasm;
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;

const Fr = new F1Field(
  Scalar.fromString(
    "21888242871839275222246405745257275088548364400416034343698204186575808495617"
  )
);

describe("Number Mastermind with Hint", function () {
  it("Should return true with correct answer", async () => {
    const circuit = await wasm_tester(
      "contracts/circuits/MastermindVariation.circom"
    );
    await circuit.loadConstraints();
    let poseidon = await buildPoseidon();

    const a = "1",
      b = "2",
      c = "3",
      d = "4";
    const solutionHash =
      "4776593854489280653299231615369836331154153341366403124590206665088184979118";
    const salt = "1234134124";

    const inputs = {
      pubGuessA: a,
      pubGuessB: b,
      pubGuessC: c,
      pubGuessD: d,
      pubNumHit: "4",
      pubNumBlow: "0",
      pubSolnHash: solutionHash,
      privSolnA: a,
      privSolnB: b,
      privSolnC: c,
      privSolnD: d,
      privSalt: salt,
    };

    const w = await circuit.calculateWitness(inputs, true);
    const h = poseidon([salt, a, b, c, d]);

    expect(Fr.eq(Fr.e(w[0]), Fr.e(1))).to.be.true;
    expect(Fr.eq(Fr.e(w[1]), Fr.e(poseidon.F.toString(h, 10)))).to.be.true;
  });

  it("Should fail with wrong answer", async () => {
    const circuit = await wasm_tester(
      "contracts/circuits/MastermindVariation.circom"
    );
    await circuit.loadConstraints();
    let poseidon = await buildPoseidon();

    const a = "1",
      b = "2",
      c = "3",
      d = "4";
    const solutionHash =
      "4776593854489280653299231615369836331154153341366403124590206665088184979118";
    const salt = "1234134124";

    const inputs = {
      pubGuessA: a,
      pubGuessB: b,
      pubGuessC: c,
      pubGuessD: d,
      pubNumHit: "4",
      pubNumBlow: "0",
      pubSolnHash: solutionHash,
      privSolnA: a,
      privSolnB: b,
      privSolnC: b,
      privSolnD: b,
      privSalt: salt,
    };

    expect(circuit.calculateWitness(inputs, true)).to.be.reverted;
  });
});

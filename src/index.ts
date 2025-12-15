import express from "express";
import {
  Contract,
  Wallet,
  JsonRpcProvider,
  solidityPacked,
  keccak256,
  getBytes,
} from "ethers";
import cors from "cors";

import { contract_address, abi } from "./network.js";
// Note: We use 'type' imports when appropriate for better tree-shaking and clarity
const RPC_URL = "https://api.infra.mainnet.somnia.network";
const PKEY = "c1c20f8f3b26d3120cce3e68b273e3d218eb3f49e4d193a07fb841c4a15b9c82";

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PKEY, provider);

const app = express();
app.use(cors());
app.get("/", (_req, res) => {
  res.send("Hello Express!");
});

app.post("/verify_score", async (req, res) => {
  try {
    const { address, score } = req.body;
    console.log(address, score);
    const contract = new Contract(contract_address, abi, provider);
    const current_nonce = await contract.get_nonce(address);
    const nonce = Number(current_nonce) + 1;
    const packed = solidityPacked(
      ["address", "uint256", "uint256"],
      [address, score, nonce] // contract.target = address in v6
    );
    const hash = keccak256(packed);
    const signature = await wallet.signMessage(getBytes(hash));
    console.log(signature);
    res.json({ signature, nonce: Number(nonce) });
  } catch (err) {
    console.log(err);
    res.send("ERROR SIGNING MESSAGE");
  }
});

export default app;

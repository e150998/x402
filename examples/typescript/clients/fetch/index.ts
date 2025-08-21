import { config } from "dotenv";
import { Hex} from "viem";
import { decodeXPaymentResponse, wrapFetchWithPayment } from "x402-fetch";
import { LocalAccountSigner } from "@aa-sdk/core";
config();

const privateKey = process.env.PRIVATE_KEY as Hex;
const baseURL = process.env.RESOURCE_SERVER_URL as string; // e.g. https://example.com
const endpointPath = process.env.ENDPOINT_PATH as string; // e.g. /weather
const url = `${baseURL}${endpointPath}`; // e.g. https://example.com/weather

if (!baseURL || !privateKey || !endpointPath) {
  console.error("Missing required environment variables");
  process.exit(1);
}


const account = LocalAccountSigner.privateKeyToAccountSigner(privateKey);

console.log("Using account:", account, typeof account);


const fetchWithPayment = wrapFetchWithPayment(fetch, account.inner);

fetchWithPayment(url, {
  method: "GET",
})
  .then(async response => {
    const body = await response.json();
    console.log("body",body);

    const paymentResponse = decodeXPaymentResponse(response.headers.get("x-payment-response")!);
    console.log(paymentResponse);
  })
  .catch(error => {
    // console.error("Error during fetch with payment:", error);
    console.error(error.response?.data?.error);
  });

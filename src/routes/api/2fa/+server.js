import { json } from "@sveltejs/kit";

export async function GET(event) {
  let otp = `${Math.floor(Math.random() * 10)}${Math.floor(
    Math.random() * 10
  )}${Math.floor(Math.random() * 10)}${Math.floor(
    Math.random() * 10
  )}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
  const options = {
    status: 200,
  };
  return json({ otp: otp, options });
}

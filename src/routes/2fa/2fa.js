let code;
export const postData = async (url = "", data = {}) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  try {
    const received = await res.json();
    return received;
  } catch (error) {
    console.log("ERROR: " + error);
  }
};
export const waitForData = async () => {
  await fetch("/api/2fa").then(async (res) => {
    code = await res.json();
    code = parseInt(code.otp);
  });
  return code;
};
export const getCode = async () => {
  return code;
}
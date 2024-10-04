<script>
  import { goto } from "$app/navigation";
  import Swal from "sweetalert";
  import { getCode, postData, waitForData } from "./2fa.js";
  import global from "../Global";
  import { pb, curruntUser } from "$lib/Pocketbase.js";
  //  let code = randomotp();
  let enteredcode;
  let email;
  async function verify() {
    if ($curruntUser.email == email) {
      let queryObj = {
        typemail: "verify",
        subject: "Verification E-mail",
        to: email,
        code: await waitForData(),
      };
      postData("https://rentapp-backend-3pnf.onrender.com/verify", queryObj);
    } else {
      Swal("Incorrect Email", "Email not correct", "error");
    }
  }
  async function check() {
    console.log(await getCode());
    if ((await getCode()) == enteredcode) {
      global.verified = true;
      goto("/Main");
    } else {
      Swal("Incorrect", "The One Time Password is incorrect", "error");
    }
  }
</script>

<div class="pb-2 pt-2 bg-secondary text-light text-center">
  <h1>Enter OTP</h1>
</div>
<div class="mt-5 mx-auto">
  <div class="mb-3 w-75 container mx-auto">
    <label for="email" class="form-label">Email:</label>
    <input
      class="form-control bg-secondary text-light"
      id="email"
      bind:value={email}
      on:focusout={verify}
    />
    <label for="email" class="form-label">One Time Password:</label>
    <input
      class="form-control bg-secondary text-light"
      id="email"
      bind:value={enteredcode}
    />
    <button
      type="submit"
      class="btn mt-3 btn-secondary float-end"
      id="login-btn"
      on:click={check}>Check</button
    >
  </div>
</div>

<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import Swal from "sweetalert";
  import { curruntUser, pb } from "../../lib/Pocketbase";
  import { randomotp, postData } from "./2fa";
  import global from "../Global";
  let cu = $curruntUser;
  let code = randomotp();
  let enteredcode;
  function verify(email) {
    let queryObj = {
      typemail: "verify",
      subject: "Verification E-mail",
      to: email,
      code: code,
    };
    postData("http://127.0.0.1:3000/verify", queryObj);
  }
  function check() {
    if (code == enteredcode) {
      global.verified = true;
      goto("/Main");
    } else {
      Swal("Incorrect", "The One Time Password is incorrect", "error");
    }
  }
  onMount(() => {
    verify(cu.email);
  });
</script>

<div class="pb-2 pt-2 bg-secondary text-light text-center">
  <h1>Enter OTP</h1>
</div>
<div class="mt-5 mx-auto">
  <div class="mb-3 w-75 container mx-auto">
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

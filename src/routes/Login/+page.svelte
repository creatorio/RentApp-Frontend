<!-- Login.svelte -->
<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { pb } from "$lib/Pocketbase.js";
  onMount(() => {
    captcha();
  });
  let username;
  let password;
  let captchaValue = "";
  let cap = { input: "", value: "" };
  import Swal from "sweetalert";
  import Global from "../Global";
  let errors = {};
  function captcha() {
    const fonts = ["cursive", "sans-serif", "serif", "monospace"];
    function generateCaptcha() {
      let value = btoa(Math.random() * 1000000000);
      value = value.substr(0, 5 + Math.random() * 5);
      captchaValue = value;
    }
    function setCaptcha() {
      let html = captchaValue
        .split("")
        .map((char) => {
          const rotate = Math.round(Math.random() * 40);
          const font = Math.trunc(Math.random() * fonts.length);
          const fsize = Math.random() * 40;
          return `<span 
        style="
          transform:rotate(${rotate}deg);
          font-family:${fonts[font]};
          font-size:${fsize};
        "
        class="capspan"
      >${char}</span>`;
        })
        .join("");
      document.querySelector(".preview").innerHTML = html;
    }
    function initCaptcha() {
      document
        .querySelector(".captcha-refresh")
        .addEventListener("click", function () {
          generateCaptcha();
          setCaptcha();
        });
      generateCaptcha();
      setCaptcha();
    }
    initCaptcha();
  }
  let inputCaptchaValue;

  async function handleSubmit() {
    cap.input = inputCaptchaValue;
    cap.value = captchaValue;
    // Form validation
    if (!username || !password || cap.input != cap.value) {
      !username ? Swal("Incorrect Username", "", "error") : "";
      !password ? Swal("Incorrect Password", "", "error") : "";
      cap.input != cap.value ? Swal("Incorrect Captcha", "", "error") : "";

      return;
    }
    await Swal(
      "Success",
      `Please enter otp in the next step.The otp is sent on your email.`,
      "success"
    );
    try {
      await pb.collection("users").authWithPassword(username, password);
    } catch (e) {
      return;
    }
    Global.password = password;
    goto("/2fa");
  }
</script>

<div class="pb-2 pt-2 bg-secondary text-light text-center">
  <h1>Login</h1>
</div>

<div class="mt-5 mx-auto">
  <div class="mb-3 w-75 container mx-auto">
    <label for="email" class="form-label">Username:</label>
    <input
      class="form-control bg-dark text-light border border-light border-2"
      id="email"
      bind:value={username}
    />
  </div>
  <div class="mb-3 w-75 container mx-auto">
    <label for="password" class="form-label">Password:</label>
    <input
      type="password"
      class="form-control bg-dark text-light border border-light border-2"
      id="password"
      bind:value={password}
    />

    <div class="captcha">
      <label for="captcha-input" class="form-label">Captcha:</label>
      <div class="preview"></div>
      <div class="captcha-form">
        <input
          type="text"
          id="captcha-form"
          class="capinput"
          placeholder="Enter captcha text"
          bind:value={inputCaptchaValue}
        />
        <button class="captcha-refresh">
          <svg
            id="Layer_1"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 118.04 122.88"
            ><path
              d="M16.08,59.26A8,8,0,0,1,0,59.26a59,59,0,0,1,97.13-45V8a8,8,0,1,1,16.08,0V33.35a8,8,0,0,1-8,8L80.82,43.62a8,8,0,1,1-1.44-15.95l8-.73A43,43,0,0,0,16.08,59.26Zm22.77,19.6a8,8,0,0,1,1.44,16l-10.08.91A42.95,42.95,0,0,0,102,63.86a8,8,0,0,1,16.08,0A59,59,0,0,1,22.3,110v4.18a8,8,0,0,1-16.08,0V89.14h0a8,8,0,0,1,7.29-8l25.31-2.3Z"
            /></svg
          >
        </button>
      </div>
    </div>
    <div class="p mt-4 mx-auto">
      <h6>
        <div class="float-start">
          Don't have an account, <a href="/Signup">Signup</a>
        </div>
        <button
          type="submit"
          class="btn btn-secondary float-end"
          id="login-btn"
          on:click={handleSubmit}>Login</button
        >
      </h6>
    </div>
  </div>
</div>

<style>
  .p {
    display: grid;
    align-items: center;
  }
  .captcha {
    margin: 15px 0px;
  }
  .preview {
    color: #555;
    width: 100%;
    text-align: center;
    height: 40px;
    line-height: 40px;
    letter-spacing: 8px;
    border-top: 1px solid;
    border-right: 1px solid;
    border-left: 1px solid;
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
    border-width: 1.5px;
    border-color: aliceblue;
    font-family: "monospace";
  }
  .captcha-form {
    display: flex;
  }
  .capinput {
    width: 100%;
    padding: 8px;
    border-bottom: 1px solid #888;
    border-left: 1px solid #888;
    border-width: 1.5px;
    border-color: aliceblue;
    border-bottom-left-radius: 7px;
  }
  .captcha-refresh {
    width: 40px;
    border-bottom: 1px solid #888;
    border-right: 1px solid #888;
    border-width: 1.5px;
    border-color: aliceblue;
    border-bottom-right-radius: 7px;
    cursor: pointer;
  }
</style>

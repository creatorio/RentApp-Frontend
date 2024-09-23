<!-- Login.svelte -->
<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { pb, curruntUser } from "../../lib/Pocketbase.js";
  onMount(() => {
    captcha();
  });
  let username;
  let password;
  let captchaValue = "";
  let cap = { input: "", value: "" };
  import Swal from "sweetalert";
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
    await pb.collection("users").authWithPassword(username, password);
    goto("/2fa");
  }
</script>

<div class="pb-2 pt-2 bg-secondary text-light text-center">
  <h1>Login</h1>
</div>

<div class="mt-5 mx-auto">
  <div class="mb-3 w-75 container mx-auto">
    <label for="email" class="form-label">Username</label>
    <input
      class="form-control bg-secondary text-light"
      id="email"
      bind:value={username}
    />
  </div>
  <div class="mb-3 w-75 container mx-auto">
    <label for="password" class="form-label">Password</label>
    <input
      type="password"
      class="form-control bg-secondary text-light"
      id="password"
      bind:value={password}
    />

    <div class="captcha">
      <label for="captcha-input" class="caplabel">Enter Captcha</label>
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
          <i class="fa fa-refresh"></i>
        </button>
      </div>
    </div>
    <div class="p mt-4">
      <h6>
        Don't have an account, <a href="/Signup">Signup</a><button
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
    padding-left: 14vw;
    padding-right: 14vw;
    display: grid;
    align-items: center;
  }
  .caplabel {
    display: block;
    font-size: 15px;
    color: #111;
    margin-bottom: 5px;
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
    border: 1px dashed #888;
    font-family: "monospace";
  }
  .capspan {
    display: inline-block;
    user-select: none;
  }
  .captcha-form {
    display: flex;
  }
  .capinput {
    width: 100%;
    padding: 8px;
    border: 1px solid #888;
  }
  .captcha-refresh {
    width: 40px;
    border: none;
    outline: none;
    background: #888;
    color: #eee;
    cursor: pointer;
  }
</style>

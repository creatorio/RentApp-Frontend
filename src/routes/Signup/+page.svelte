<!-- Signup.svelte -->
<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { pb } from "$lib/Pocketbase";
  import Global from "../Global";
  onMount(() => {
    captcha();
  });
  let username;
  let password;
  let passwordConfirm;
  let email;
  let formData = {
    username,
    password,
    passwordConfirm,
    email,
  };
  let captchaValue = "";
  let cap = { input: "", value: "" };
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
  let errors = {};

  async function handleSubmit(event) {
    event.preventDefault();
    cap.input = inputCaptchaValue;
    cap.value = captchaValue;
    // Form validation
    if (
      !formData.username ||
      !formData.password ||
      !formData.email ||
      !formData.passwordConfirm ||
      cap.input != cap.value
    ) {
      errors = {
        username: !formData.username ? "Username is required." : "",
        email: !formData.email ? "Email is required." : "",
        password: !formData.password ? "Password is required." : "",
        confirmPassword: !formData.passwordConfirm
          ? "Confirm password is required."
          : "",
        captcha: cap.input != cap.value ? "Captcha Not Correct." : "",
      };
      return;
    }
    if (formData.password != formData.passwordConfirm) {
      errors.confirmPassword = "Passwords do not match.";
      return;
    } else {
      errors.confirmPassword = "";
    }
    const data = {
      username: formData.username,
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
      email: formData.email,
    };
    const createduser = await pb.collection("users").create(data);
    try {
      await pb
        .collection("users")
        .authWithPassword(data.username, data.password);
    } catch (e) {
      return;
    }
    Global.password = data.password;
    goto("/2fa");
  }
</script>

<div class="pb-2 pt-2 bg-secondary text-light text-center">
  <h1>Create A New Account</h1>
</div>

<form on:submit={handleSubmit} class="bg-dark text-light">
  <table class="mx-auto w-60 mt-2">
    <tr>
      <td
        ><div class="mb-3 mx-auto w-40 container">
          <label for="name" class="form-label">Email:</label>
          <input
            class="form-control border-2 bg-secondary text-light"
            id="name"
            bind:value={formData.email}
          />{#key errors.email}
            {#if errors.email}<div class="invalid-feedback">
                {errors.email}
              </div>{/if}
          {/key}
        </div>
      </td>
      <td
        ><div class="mb-3 mx-auto w-40 container">
          <label for="email" class="form-label">Username:</label>
          <input
            class="form-control border-2 bg-secondary text-light"
            id="email"
            bind:value={formData.username}
          />
          {#key errors.username}
            {#if errors.username}<div class="invalid-feedback">
                {errors.username}
              </div>{/if}
          {/key}
        </div>
      </td>
    </tr>
    <tr>
      <td
        ><div class="mb-3 mx-auto w-40 container">
          <label for="password" class="form-label">Password:</label>
          <input
            type="password"
            class="form-control border-2 bg-secondary text-light"
            id="password"
            bind:value={formData.password}
          />{#key errors.password}
            {#if errors.password}<div class="invalid-feedback">
                {errors.password}
              </div>{/if}
          {/key}
        </div>
      </td>
      <td>
        <div class="mb-3 mx-auto w-40 container">
          <label for="confirmPassword" class="form-label">Confirm Pwd:</label>
          <input
            type="password"
            class="form-control border-2 bg-secondary text-light"
            id="confirmPassword"
            bind:value={formData.passwordConfirm}
          />{#key errors.confirmPassword}
            {#if errors.confirmPassword}<div class="invalid-feedback">
                {errors.confirmPassword}
              </div>{/if}
          {/key}
        </div>
      </td>
    </tr>
  </table>
  <div class="captcha w-75 mx-auto">
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
      {#if errors.password}<div class="invalid-feedback">
          {errors.password}
        </div>{/if}
    </div>
  </div>
  <div class="p w-75 mx-auto">
    <h6>
      Already have an account, <a href="/Login">Login</a><button
        type="submit"
        class="btn btn-secondary float-end">Signup</button
      >
    </h6>
  </div>
</form>

<style>
  .w-40 {
    width: 38.5vw;
  }
  .w-60 {
    width: 60vw;
  }
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

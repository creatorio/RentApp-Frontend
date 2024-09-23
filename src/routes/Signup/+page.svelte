<!-- Signup.svelte -->
<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { pb } from "../../lib/Pocketbase";
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
    await pb.collection("users").authWithPassword(data.username, data.password);
    goto("/2fa");
  }
</script>

<div class="pb-2 pt-2 bg-secondary text-light text-center">
  <h1>Create A New Account</h1>
</div>

<form on:submit={handleSubmit} class="bg-dark text-light">
  <table class="mx-auto text-center">
    <tr>
      <td
        ><div class="mb-3 mx-auto w-40 container">
          <label for="name" class="form-label">Email</label>
          <input
            class="form-control border-2 bg-secondary text-light"
            id="name"
            bind:value={formData.email}
          />
          {#if errors.email}<div class="invalid-feedback">
              {errors.email}
            </div>{/if}
        </div>
      </td>
      <td
        ><div class="mb-3 mx-auto w-40 container">
          <label for="email" class="form-label">Username(No Spaces)</label>
          <input
            class="form-control border-2 bg-secondary text-light"
            id="email"
            bind:value={formData.username}
          />
          {#if errors.username}<div class="invalid-feedback">
              {errors.username}
            </div>{/if}
        </div>
      </td>
    </tr>
    <tr>
      <td
        ><div class="mb-3 mx-auto w-40 container">
          <label for="password" class="form-label">Password(No Spaces)</label>
          <input
            type="password"
            class="form-control border-2 bg-secondary text-light"
            id="password"
            bind:value={formData.password}
          />
          {#if errors.password}<div class="invalid-feedback">
              {errors.password}
            </div>{/if}
        </div>
      </td>
      <td>
        <div class="mb-3 mx-auto w-40 container">
          <label for="confirmPassword" class="form-label"
            >Confirm Password(No Spaces)</label
          >
          <input
            type="password"
            class="form-control border-2 bg-secondary text-light"
            id="confirmPassword"
            bind:value={formData.passwordConfirm}
          />
          {#if errors.confirmPassword}<div class="invalid-feedback">
              {errors.confirmPassword}
            </div>{/if}
        </div>
      </td>
    </tr>
  </table>
  <div class="captcha w-75 mx-auto">
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
      {#if errors.password}<div class="invalid-feedback">
          {errors.password}
        </div>{/if}
    </div>
  </div>
  <div class="p">
    <h6>
      Already have an account, <a href="/Login">Login</a><button
        type="submit"
        class="btn btn-secondary float-end mt-3">Signup</button
      >
    </h6>
  </div>
</form>

<style>
  .w-40 {
    width: 40vw;
  }
  .p {
    padding-left: 12vw;
    padding-right: 12vw;
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

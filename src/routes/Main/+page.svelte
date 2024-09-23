<!-- App.svelte -->
<script>
  import global from "../Global";
  import { goto } from "$app/navigation";
  import { pb, curruntUser } from "$lib/Pocketbase";
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import Global from "../Global";
  import { writable } from "svelte/store";
  var cu = $curruntUser;
  let unsubscribe;
  var properties = [];
  var propertynew = {
    user: null,
    location: null,
    numberoftenants: null,
    name: null,
  };
  onMount(async () => {
    unsubscribe = await pb
      .collection("Property")
      .subscribe("*", async ({ action, record }) => {
        if (action === "create") {
          // Fetch associated user
          const user = await pb.collection("users").getOne(record.user);
          record.expand = { user };
          properties = [...properties, record];
        }
        if (action === "delete") {
          properties = properties.filter((m) => m.id !== record.id);
        }
      });

    // You can add any necessary logic here
    let a = await pb.collection("property").getList(1, 50, { expand: "users" });
    properties = a.items;
  });
  function gotosecure(url, id) {
    Global.property = id;
    goto(url);
  }
  function coveri() {
    //FIXME:
    // if (browser) {
    //  console.log("No login");
    //  goto("/Login");
    //}
  }
  function Logout() {
    pb.authStore.clear();
    global.verified = false;
    goto("/Login");
  }
  async function createproperty() {
    propertynew.user = await pb.authStore.model.id;
    if (
      propertynew.location != null &&
      propertynew.name != null &&
      propertynew.numberoftenants != null &&
      propertynew.user != null
    ) {
      await pb.collection("property").create(propertynew);
      propertynew.location = null;
      propertynew.name = null;
      propertynew.numberoftenants = null;
      propertynew.user = $curruntUser.id;
    }
  }
  async function deletepro(id) {
    let a = await pb
      .collection("tenants")
      .getList(1, 50, { expand: "property" });
    let b = a.items;
    for (let i = 0; i < b.length; i++) {
      const element = b[i];
      if (element.expand?.property?.id == id) {
        await pb.collection("tenants").delete(element.id);
      }
    }
    await pb.collection("property").delete(id);
  }
  function deleteten(id) {
    pb.collection("tenants").delete(id);
  }
  onDestroy(() => {
    unsubscribe?.();
  });
</script>

{#if !$curruntUser || !global.verified}{coveri()}{/if}
<div class="col w-100 text-center mx-auto">
  <div class="navbar navbar-dark bg-secondary w-100 text-center mx-auto">
    <div class="container-fluid mx-auto">
      <a class="navbar-brand" href="#">Properties</a>
      <button class="btn btn-dark text-light float-end" on:click={Logout}
        >Logout</button
      >
    </div>
  </div>

  <div class="row w-100 text-center mx-auto">
    <div class="w-100 text-center mx-auto">
      <button
        data-bs-toggle="collapse"
        data-bs-target="#demo"
        class="w-100 btn btn-secondary mt-3">New Property</button
      >

      <div id="demo" class="text-light text-center collapse w-100 mx-auto">
        <div class="card mx-auto text-center">
          <div class="card-body">
            <h4 class="card-title title-text">
              <input
                class="btn border border-2 border-light"
                bind:value={propertynew.name}
              />
            </h4>
            <p>
              This property is located at <input
                class="btn border border-2 border-light"
                bind:value={propertynew.location}
              />
            </p>
            <p>
              This property can accommodate <input
                class="btn border border-2 border-light"
                bind:value={propertynew.numberoftenants}
              /> people
            </p>

            <button class="btn btn-secondary p-1" on:click={createproperty}
              >Create</button
            >
          </div>
        </div>
      </div>
    </div>

    {#each properties as property, d}
      <div class="w-100 text-center mx-auto">
        <button
          data-bs-toggle="collapse"
          data-bs-target="#demo{d}"
          class="w-100 btn btn-secondary mt-3 mid"
          >{property.name}
        </button>
        <div id="demo{d}" class="text-light text-center collapse w-100 mx-auto">
          <div class="card mx-auto text-center">
            <div class="card-body">
              <h4 class="card-title">
                <p>{property.name}</p>
              </h4>
              <p>This property is located at {property.location}</p>
              <p>
                This property can accommodate {property.numberoftenants} people
              </p>
              <p>
                <button
                  class="btn btn-secondary"
                  on:click={() => {
                    deletepro(property.id);
                  }}>Delete this property</button
                >
              </p>
              <button
                class="btn btn-secondary p-1"
                on:click={gotosecure("/Property", property.id)}>Details</button
              >
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .title-text {
    font-family: monospace;
  }
  .mid {
    display: inline-block;
    vertical-align: middle;
    align-items: center;
  }
  .fs {
    padding: 2;
    background: none;
    border: 0;
  }
  .fs:focus {
    outline: 0;
  }
</style>

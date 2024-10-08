<!-- App.svelte -->
<script>
  console.log(crypto.subtle);
  import global from "../Global";
  import { goto } from "$app/navigation";
  import Swal from "sweetalert";
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

     if (browser) {
      console.log("No login");
      goto("/Login");
    }
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
    await Swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      buttons: {
        cancel: "No, Don't Delete",
        confirm: { text: "Yes, Delete", value: true },
      },
    }).then((result) => {
      if (!result) {
        return dp;
      }
    });
    await Swal({
      title: "Deleted!",
      text: "Your file has been deleted.",
      icon: "success",
    });
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
        <div class="card border border-2 mx-auto text-center">
          <div class="card-body">
            <div class="mx-auto w-75">
              <label for="nam" class="form-label float-start">Name:</label>
              <input
                id="nam"
                class="form-control bg-dark text-light border border-light border-2"
                bind:value={propertynew.name}
              />

              <label for="loc" class="mt-2 form-label float-start"
                >Location:</label
              >
              <input
                id="loc"
                class="form-control bg-dark text-light border border-light border-2"
                bind:value={propertynew.location}
              />

              <label for="acc" class="mt-2 form-label float-start"
                >Number Of Tenants:</label
              >
              <input
                id="acc"
                class="form-control bg-dark text-light border border-light border-2"
                bind:value={propertynew.numberoftenants}
              />

              <button
                class="form-control bg-secondary text-light mt-2"
                on:click={createproperty}>Create</button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table-condensed table-bordered mt-3 table">
        <thead>
          <tr
            ><th>Name</th><th>Location</th><th>Tenants #</th><th>Details</th><th
              >Delete</th
            ></tr
          >
        </thead>
        <tbody>
          {#each properties as property, d}
            <tr
              ><td class="text-wrap"> {property.name} </td><td class="text-wrap"
                >{property.location}</td
              ><td class="text-wrap">{property.numberoftenants}</td><td
                class="text-wrap"
              >
                <button
                  class="bg-dark border-0"
                  on:click={() => {
                    gotosecure("/Property", properties[d].id);
                  }}>Details</button
                ></td
              ><td class="text-wrap">
                <button
                  class="bg-dark border-0"
                  on:click={() => {
                    deletepro(property.id);
                  }}>Delete this property</button
                ></td
              ></tr
            >
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .table-condensed > thead > tr > th,
  .table-condensed > tbody > tr > th,
  .table-condensed > tfoot > tr > th,
  .table-condensed > thead > tr > td,
  .table-condensed > tbody > tr > td,
  .table-condensed > tfoot > tr > td {
    padding: 1px;
  }
  td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .w-90 {
    width: 97.5vw;
  }
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

<!-- App.svelte -->
<script>
  import global from "../Global";
  import Swal from "sweetalert";
  import { goto } from "$app/navigation";
  import { pb, curruntUser } from "$lib/Pocketbase";
  import { encrypt } from "$lib/Crypto";
  import { setimage, ArrayBuffertobase64 } from "$lib/BinUtils";
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import Global from "../Global";
  var cu = $curruntUser;
  let unsubscribe;
  var tenants = [];
  let startoflease;
  let endoflease;
  let file;
  let fileencoded;
  var tenantnew = {
    property: null,
    Name: null,
    encryptfile: null,
    iv: null,
  };
  onMount(async () => {
    unsubscribe = await pb
      .collection("tenants")
      .subscribe("*", async ({ action, record }) => {
        if (action === "create") {
          // Fetch associated user
          const user = await pb.collection("property").getOne(record.property);
          record.expand = { user };
          tenants = [...tenants, record];
        }
        if (action === "delete") {
          tenants = tenants.filter((m) => m.id !== record.id);
        }
      });

    // You can add any necessary logic here
    let a = await pb
      .collection("tenants")
      .getList(1, 50, { expand: "Property" });
    tenants = a.items;
  });
  function gotosecure(url, id) {
    Global.tenant = id;
    goto(url);
  }
  function encodefile() {
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        fileencoded = ArrayBuffertobase64(e.target.result);
        console.log(fileencoded);
      };
      reader.readAsArrayBuffer(file[0]);
    }, 1000);
  }
  function coveri() {
    //FIXME:
    // if (browser) {
    //  console.log("No login");
    //  goto("/Login");
    //}
  }
  function returnNada() {
    return "";
  }
  function back() {
    goto("/Main");
  }
  async function createtenant() {
    setTimeout(async () => {
      tenantnew.property = global.property;

      if (tenantnew.Name != null && tenantnew.property != null) {
        const data = await encrypt(fileencoded, global.password);
        tenantnew.encryptfile = data;
        await pb.collection("tenants").create(tenantnew);
        tenantnew.Name = null;
        tenantnew.property = global.property;
      }
    }, 1005);
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
      .collection("tenantdata")
      .getList(1, 50, { expand: "tenant" });
    let b = a.items;
    for (let i = 0; i < b.length; i++) {
      const element = b[i];
      if (element.expand?.tenant?.id == id) {
        await pb.collection("tenantdata").delete(element.id);
      }
    }
    await pb.collection("tenants").delete(id);
  }
  onDestroy(() => {
    unsubscribe?.();
  });
</script>

{#if !$curruntUser || !global.verified}{coveri()}{/if}
{#if !global.property && browser}
  {goto("/Main")}
{/if}
<div class="col w-100 text-center mx-auto">
  <div class="navbar navbar-dark bg-secondary w-100 text-center mx-auto">
    <div class="container-fluid mx-auto">
      <a class="navbar-brand">Tenants</a>
      <button class="btn btn-dark text-light float-end" on:click={back}
        >Back</button
      >
    </div>
  </div>

  <div class="row w-100 text-center mx-auto">
    <div class="w-100 text-center mx-auto">
      <button
        data-bs-toggle="collapse"
        data-bs-target="#demo"
        class="w-100 btn btn-secondary mt-3">New Tenant</button
      >

      <div id="demo" class="text-light text-center collapse w-100 mx-auto">
        <div class="card mx-auto text-center">
          <div class="card-body">
            <h4 class="card-title title-text">
              <input
                class="btn border border-2 border-light"
                bind:value={tenantnew.Name}
              />
            </h4>
            <input
              type="file"
              class="btn border border-2 border-light"
              on:change={encodefile}
              bind:files={file}
            />
            <button class="btn btn-secondary p-1" on:click={createtenant}
              >Create</button
            >
          </div>
        </div>
      </div>
    </div>
    {#key tenants}
      {#each tenants as tenant, d}
        <div class="w-100 text-center mx-auto">
          <button
            data-bs-toggle="collapse"
            data-bs-target="#demo{d}"
            class="w-100 btn btn-secondary mt-3 mid"
            >{tenant.Name}
          </button>
          <div
            id="demo{d}"
            class="text-light text-center collapse w-100 mx-auto"
          >
            <div class="card mx-auto text-center">
              <div class="card-body">
                <h4 class="card-title">
                  <p>{tenant.Name}</p>
                </h4>

                <iframe id={"embed" + d} />
                {returnNada(
                  setimage(tenant.encryptfile, "embed" + d, global.password)
                )}
                <p>
                  <button
                    class="btn btn-secondary"
                    on:click={() => {
                      deletepro(tenant.id);
                    }}>Delete this tenant's info from the database</button
                  >
                </p>
                <button
                  class="btn btn-secondary p-1"
                  on:click={gotosecure("/tenant", tenant.id)}>Details</button
                >
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/key}
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
</style>

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
  let inputfile;
  let trigger;
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
    tenants = tenants.filter((e) => {
      console.log(e.property);
      console.log(global.property);
      return e.property == global.property;
    });
  });
  function gotosecure(url, id) {
    Global.tenant = id;
    goto(url);
  }
  async function encodefile() {
    let done = false;
    setTimeout(async () => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        fileencoded = ArrayBuffertobase64(e.target.result);
        console.log(fileencoded);
      };
      reader.readAsArrayBuffer(file[0]);
    }, 1000);
  }
  function coveri() {
    if (browser) {
      console.log("No login");
      goto("/Login");
    }
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
            <p>
              <label for="name" class="form-label">Name:</label>
              <input
                id="name"
                class="btn border border-rounded border-2"
                bind:value={tenantnew.Name}
              />
            </p>

            <p>
              <input
                type="file"
                id="file"
                on:change={encodefile}
                bind:files={file}
              /><label for="file" class="btn border border-rounded border-2">
                Select file
              </label>
            </p>
            <p>
              <button class="btn btn-secondary p-1" on:click={createtenant}
                >Create</button
              >
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table-condensed table-bordered mt-3 table">
        <thead>
          <tr><th>Name</th><th>ID Proof</th><th>Details</th><th>Delete</th></tr>
        </thead>
        <tbody>
          {#each tenants as tenant, d}
            <tr
              ><td class="text-wrap"> {tenant.Name} </td><td class="text-wrap">
                <!-- Modal -->
                <div
                  id={"myModal" + d}
                  class="modal fade modal-lg"
                  role="dialog"
                >
                  <div class="modal-dialog">
                    <!-- Modal content-->
                    <div class="modal-content">
                      <div class="modal-header">
                        <h4 class="modal-title">ID Proof</h4>
                      </div>
                      <div class="modal-body">
                        <embed id={"embed" + d} />
                      </div>
                      <div class="modal-footer">
                        <button
                          type="button"
                          class="btn btn-default"
                          data-bs-dismiss="modal">Close</button
                        >
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  class="bg-dark border-0"
                  data-bs-toggle="modal"
                  data-bs-target={"#myModal" + d}>View Pdf</button
                >
                {returnNada(
                  setimage(tenant.encryptfile, "embed" + d, global.password)
                )}</td
              ><td class="text-wrap">
                <button
                  class="bg-dark border-0"
                  on:click={gotosecure("/tenant", tenant.id)}>Details</button
                ></td
              ><td class="text-wrap">
                <button
                  class="bg-dark border-0"
                  on:click={() => {
                    deletepro(tenant.id);
                  }}>Delete Info</button
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
  .title-text {
    font-family: monospace;
  }
  .mid {
    display: inline-block;
    vertical-align: middle;
    align-items: center;
  }
  input[type="file"] {
    display: none;
  }

  .custom-file-upload {
    border: 1px solid #ccc;
    display: inline-block;
    padding: 6px 12px;
    cursor: pointer;
  }
</style>

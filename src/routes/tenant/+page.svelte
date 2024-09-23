<!-- App.svelte -->
<script>
  import { sendmonpa } from "./Notif";
  import send from "./Notif";
  import global from "../Global";
  import { goto } from "$app/navigation";
  import { pb, curruntUser } from "$lib/Pocketbase";
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import Global from "../Global";
  const updatemonpa = async (i, id) => {
    console.log(tenants[i]);
    sendmonpa(tenants[i].data.monpa[id].paid, tenants[i].tenant);
    await pb.collection("tenantdata").update(tenants[i].id, tenants[i]);
  };
  var cu = $curruntUser;
  let unsubscribe;
  let startoflease;
  let endoflease;
  var tenants = [];
  var tenantnew = {
    startoflease: "",
    data: {},
  };
  onMount(async () => {
    unsubscribe = await pb
      .collection("tenantdata")
      .subscribe("*", async ({ action, record }) => {
        if (action === "create") {
          // Fetch associated user
          const tenant = await pb.collection("tenants").getOne(record.tenant);
          record.expand = { tenant };
          tenants = [...tenants, record];
        }
        if (action === "delete") {
          tenants = tenants.filter((m) => m.id !== record.id);
        }
      });

    // You can add any necessary logic here
    let a = await pb
      .collection("tenantdata")
      .getList(1, 50, { expand: "tenants" });
    tenants = a.items;
  });
  function coveri() {
    // if (browser) {
    //  console.log("No login");
    //  goto("/Login");
    //}
  }
  async function deletepro(id) {
    await pb.collection("tenantdata").delete(id);
  }
  function back() {
    goto("/Property");
  }
  async function createtenant() {
    var allowed = true;
    for (let i = 0; i < tenants.length; i++) {
      console.log(tenants[i]);
      var eeee = tenants[i].data;

      for (let i = 0; i < eeee.monpa.length; i++) {
        if (!eeee.monpa[i].paid) {
          allowed = false;
        }
      }
    }
    if (!allowed) {
      return;
    }
    var monthsss = [];

    tenantnew.startoflease = startoflease;
    tenantnew.endoflease = endoflease;
    var year = 0,
      month = 0;
    var years =
      tenantnew.startoflease.charAt(0) +
      tenantnew.startoflease.charAt(1) +
      tenantnew.startoflease.charAt(2) +
      tenantnew.startoflease.charAt(3);
    console.log(years);
    years = parseInt(years, 10);
    year = years;
    var months =
      tenantnew.startoflease.charAt(5) + tenantnew.startoflease.charAt(6);
    console.log(months);
    months = parseInt(months, 10);
    var day =
      tenantnew.startoflease.charAt(8) + tenantnew.startoflease.charAt(9);
    console.log(day);
    day = parseInt(day, 10);
    if (
      months + parseInt(tenantnew.endoflease) > 12 &&
      months + parseInt(tenantnew.endoflease) < 24
    ) {
      month = months - 12 + parseInt(tenantnew.endoflease);
      year = years + 1;
    } else {
      month = months + parseInt(tenantnew.endoflease);
    }
    tenantnew.tenant = global.tenant;
    console.log(months, years, month, year);
    var duration = (year - years) * 12 + (month - months);
    console.log(duration);
    for (let i = 0; i < duration; i++) {
      console.log(months + i, months, i);
      if (months + i > 12 && i + months < 24) {
        monthsss.push(months + i - 12);
      } else {
        monthsss.push(months + i);
      }
    }
    console.log(monthsss);
    for (let i = 0; i < monthsss.length; i++) {
      const element = monthsss[i];
      console.log(element);
      send(
        "Please Collect Your Rent",
        parseInt(tenantnew.owdotmdygtr),
        tenantnew.tenant,
        element
      );
    }
    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    if (
      tenantnew.name != null &&
      tenantnew.endoflease != null &&
      tenantnew.owdotmdygtr != null &&
      tenantnew.startoflease != null &&
      tenantnew.tenant != null
    ) {
      var monpa = [];
      var num =
        tenantnew.startoflease.charAt(5) + tenantnew.startoflease.charAt(6);
      num = parseInt(num, 10) - 1;
      for (let i = 0; i < tenantnew.endoflease; i++) {
        if (num + 1 > 12) {
          num = num - 12;
        }

        monpa.push({ month: months[num], paid: false });
        num++;
      }
      tenantnew.data = { monpa };
      await pb.collection("tenantdata").create(tenantnew);
    }
  }
  onDestroy(() => {
    unsubscribe?.();
  });
  const calcendlease = (i) => {
    var year =
      tenants[i].startoflease.charAt(0) +
      tenants[i].startoflease.charAt(1) +
      tenants[i].startoflease.charAt(2) +
      tenants[i].startoflease.charAt(3);
    console.log(year);
    year = parseInt(year, 10);
    var month =
      tenants[i].startoflease.charAt(5) + tenants[i].startoflease.charAt(6);
    console.log(month);
    month = parseInt(month, 10) - 1;
    var day =
      tenants[i].startoflease.charAt(8) + tenants[i].startoflease.charAt(9);
    console.log(day);
    day = parseInt(day, 10);
    if (
      month + parseInt(tenants[i].endoflease) > 12 &&
      month + parseInt(tenants[i].endoflease) < 24
    ) {
      month = month - 12 + parseInt(tenants[i].endoflease);
      year = year + 1;
    } else {
      month = month + parseInt(tenants[i].endoflease);
    }
    day = parseInt(tenants[i].owdotmdygtr, 10);

    console.log(year, month, day);
    return year + "-" + month + "-" + day;
  };
</script>

{#if !$curruntUser || !global.verified}{coveri()}{/if}
{#if !global.tenant && browser}
  {goto("/Main")}
{/if}
<div class="col w-100 text-center mx-auto">
  <div class="navbar navbar-dark bg-secondary w-100 text-center mx-auto">
    <div class="container-fluid mx-auto">
      <a class="navbar-brand">Leases</a>
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
        class="w-100 btn btn-secondary mt-3">New Lease</button
      >

      <div id="demo" class="text-light text-center collapse w-100 mx-auto">
        <div class="card mx-auto text-center">
          <div class="card-body">
            <h4 class="card-title title-text">
              <input
                class="btn border border-2 border-light"
                bind:value={tenantnew.name}
              />
            </h4>

            <p>
              Start of the lease agreement <input
                type="datetime-local"
                bind:value={startoflease}
              />
            </p>
            <p>
              Length of the lease agreement in months (max 24)<input
                type="number"
                bind:value={endoflease}
              />
            </p>

            <p>
              On which day of the month do you get your rent (1 - 28)<input
                class="btn border border-2 border-light"
                bind:value={tenantnew.owdotmdygtr}
              />
            </p>

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
            >lease {d}
          </button>
          <div
            id="demo{d}"
            class="text-light text-center collapse w-100 mx-auto"
          >
            <div class="card mx-auto text-center border">
              <div class="card-body">
                <p>Start of Lease: {tenant.startoflease}</p>
                <p>
                  End of Lease: {() => {
                    calcendlease(d);
                  }}
                </p>
                <table
                  class="table table-dark table-hover table-border border border-2"
                >
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#key tenant.data.monpa}
                      {#each tenant.data.monpa as monpa, id}
                        <tr>
                          <td>{tenants[d].data.monpa[id].month}</td>
                          <td
                            ><input
                              on:change={() => {
                                updatemonpa(d, id);
                              }}
                              bind:checked={tenants[d].data.monpa[id].paid}
                              type="checkbox"
                            /></td
                          >
                        </tr>
                      {/each}
                    {/key}
                  </tbody>
                </table>
                <button
                  class="btn btn-secondary"
                  on:click={() => {
                    deletepro(tenant.id);
                  }}>Delete this lease</button
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

import Pocketbase from "pocketbase";

import { writable } from "svelte/store";

export const pb = new Pocketbase("http://127.0.0.1:8090");
export const curruntUser = writable(pb.authStore.model);
pb.authStore.onChange(() => {
  curruntUser.set(pb.authStore.model);
});

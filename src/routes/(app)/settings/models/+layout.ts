import { loadServices } from "./$data";
import { registerModel } from "$database";
import { keyTable } from "$database/schema";

export async function load({ depends, route }) {
  const services = await loadServices();
  registerModel(keyTable, services, depends);
  depends("view:accounts");
  return {
    services,
  };
}

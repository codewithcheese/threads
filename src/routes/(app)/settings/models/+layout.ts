import { loadServices } from "./$data";
import { registerModel } from "$database";
import { accountTable } from "$database/schema";

export async function load({ depends, route }) {
  const services = await loadServices();
  registerModel(accountTable, services, depends);
  depends("view:accounts");
  return {
    services,
  };
}

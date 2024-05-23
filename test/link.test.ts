import { expect, it } from "vitest";

it("should parse links", async () => {
  const text = "This is a message with a #My Photos #Christmas Holidays";
  const matches = text.match(/#([^#\s][^#]*)/g);
  console.log(matches); // Output: ["#My Photos", "#Christmas Holidays"]
});

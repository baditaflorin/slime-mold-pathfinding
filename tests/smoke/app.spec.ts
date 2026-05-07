import { expect, test } from "@playwright/test";

test("loads the simulator and renders a GraphViz route", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Slime Mold Pathfinding" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
    "href",
    "https://github.com/baditaflorin/slime-mold-pathfinding",
  );
  await expect(page.getByRole("link", { name: /PayPal/ })).toHaveAttribute(
    "href",
    "https://www.paypal.com/paypalme/florinbadita",
  );
  await expect(page.getByText(/v0\.1\.0/)).toBeVisible();

  await page.getByLabel("City").selectOption("tokyo");
  await expect(page.getByRole("heading", { name: "Tokyo" })).toBeVisible();
  await page.getByRole("button", { name: "Airport and bay" }).click();
  await expect(page.getByLabel("DOT route graph")).toContainText(
    "graph PhysarumRoutes",
  );

  await page.getByRole("button", { name: "Render GraphViz route graph" }).click();
  await expect(page.locator(".graph-output svg")).toBeVisible({ timeout: 15_000 });
});

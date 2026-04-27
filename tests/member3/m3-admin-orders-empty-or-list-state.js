const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);

    await driver.get("http://localhost:3000/admin/orders");
    console.log("Opened admin orders page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);
    await driver.sleep(2000);

    const bodyText = await driver.findElement(By.tagName("body")).getText();
    const lower = bodyText.toLowerCase();

    if (
      lower.includes("all orders") ||
      lower.includes("no orders found") ||
      lower.includes("select an order to view details")
    ) {
      console.log("PASS: Admin orders list state handled");
    } else {
      console.log("FAIL: Admin orders list state not recognized");
    }
  } catch (error) {
    console.error("FAIL: Admin orders list state test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
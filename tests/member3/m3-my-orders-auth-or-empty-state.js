const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/account/orders");
    console.log("Opened my orders page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);
    await driver.sleep(2500);

    const bodyText = await driver.findElement(By.tagName("body")).getText();
    const lower = bodyText.toLowerCase();

    if (
      lower.includes("please sign in to view your orders") ||
      lower.includes("no orders found") ||
      lower.includes("status:") ||
      lower.includes("my orders")
    ) {
      console.log("PASS: Orders page state handled correctly");
    } else {
      console.log("FAIL: Orders page state not recognized");
    }
  } catch (error) {
    console.error("FAIL: My Orders state test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
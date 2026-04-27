const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/checkout");
    console.log("Opened checkout page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (bodyText.toLowerCase().includes("checkout")) {
      console.log("PASS: Checkout layout rendered");
    } else {
      console.log("FAIL: Checkout layout not rendered");
    }
  } catch (error) {
    console.error("FAIL: Checkout layout test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
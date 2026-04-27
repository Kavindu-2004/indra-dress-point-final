const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/checkout");
    console.log("Opened checkout page");

    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(., 'Checkout')]")),
      10000
    );

    console.log("PASS: Checkout page loaded");
  } catch (error) {
    console.error("FAIL: Checkout page load failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
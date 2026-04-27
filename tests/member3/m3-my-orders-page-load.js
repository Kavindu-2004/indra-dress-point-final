const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/account/orders");
    console.log("Opened my orders page");

    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(., 'My Orders')]")),
      10000
    );

    console.log("PASS: My Orders page loaded");
  } catch (error) {
    console.error("FAIL: My Orders page load failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
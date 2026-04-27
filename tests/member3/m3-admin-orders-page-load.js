const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);

    await driver.get("http://localhost:3000/admin/orders");
    console.log("Opened admin orders page");

    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(., 'Orders')]")),
      10000
    );

    console.log("PASS: Admin orders page loaded");
  } catch (error) {
    console.error("FAIL: Admin orders page load failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
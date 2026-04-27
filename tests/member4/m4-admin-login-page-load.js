const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/admin/login");
    console.log("Opened admin login page");

    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(., 'Admin Sign in')]")),
      10000
    );

    console.log("PASS: Admin login page loaded");
  } catch (error) {
    console.error("FAIL: Admin login page load failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
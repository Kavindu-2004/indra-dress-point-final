const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);
    await driver.get("http://localhost:3000/admin/dashboard");
    console.log("Opened admin dashboard");

    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(., 'Dashboard')]")),
      10000
    );

    console.log("PASS: Admin dashboard loaded");
  } catch (error) {
    console.error("FAIL: Admin dashboard load failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
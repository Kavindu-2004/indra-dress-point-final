const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);
    await driver.get("http://localhost:3000/admin/newsletter");
    console.log("Opened newsletter subscribers page");

    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(., 'Newsletter Subscribers')]")),
      10000
    );

    console.log("PASS: Newsletter subscribers page loaded");
  } catch (error) {
    console.error("FAIL: Newsletter page load failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
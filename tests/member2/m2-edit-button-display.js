const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);

    await driver.get("http://localhost:3000/admin/products");
    console.log("Opened admin products page");

    const editButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Edit')]")),
      10000
    );

    if (editButton) {
      console.log("PASS: Edit button displayed");
    } else {
      console.log("FAIL: Edit button not displayed");
    }
  } catch (error) {
    console.error("FAIL: Edit button test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
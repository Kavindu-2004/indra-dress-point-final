const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);

    await driver.get("http://localhost:3000/admin/products");
    console.log("Opened admin products page");

    const deleteButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Delete')]")),
      10000
    );

    if (deleteButton) {
      console.log("PASS: Delete button displayed");
    } else {
      console.log("FAIL: Delete button not displayed");
    }
  } catch (error) {
    console.error("FAIL: Delete button test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
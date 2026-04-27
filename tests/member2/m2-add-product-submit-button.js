const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);

    await driver.get("http://localhost:3000/admin/products");
    console.log("Opened admin products page");

    const addButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Add Product')]")),
      10000
    );

    if (addButton) {
      console.log("PASS: Add Product button found");
    } else {
      console.log("FAIL: Add Product button not found");
    }
  } catch (error) {
    console.error("FAIL: Add product button test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
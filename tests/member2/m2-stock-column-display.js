const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);

    await driver.get("http://localhost:3000/admin/products");
    console.log("Opened admin products page");

    const table = await driver.wait(
      until.elementLocated(By.tagName("table")),
      10000
    );

    const tableText = await table.getText();

    if (tableText.includes("Stock")) {
      console.log("PASS: Stock column displayed");
    } else {
      console.log("FAIL: Stock column not displayed");
    }
  } catch (error) {
    console.error("FAIL: Stock column test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
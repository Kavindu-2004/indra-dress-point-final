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

    if (
      tableText.includes("Image") &&
      tableText.includes("Name") &&
      tableText.includes("Category") &&
      tableText.includes("Price") &&
      tableText.includes("Stock")
    ) {
      console.log("PASS: Product table displayed");
    } else {
      console.log("FAIL: Product table headers not displayed correctly");
    }
  } catch (error) {
    console.error("FAIL: Product table display test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
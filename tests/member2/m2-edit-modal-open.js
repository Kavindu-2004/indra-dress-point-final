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

    await editButton.click();

    await driver.wait(
      until.elementLocated(By.xpath("//h3[contains(., 'Edit Product')]")),
      10000
    );

    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (
      bodyText.includes("Edit Product") &&
      bodyText.includes("Save Changes") &&
      bodyText.includes("Product Name") &&
      bodyText.includes("Price (LKR)") &&
      bodyText.includes("Stock Qty")
    ) {
      console.log("PASS: Edit product modal opened correctly");
    } else {
      console.log("FAIL: Edit product modal content not correct");
    }
  } catch (error) {
    console.error("FAIL: Edit modal open test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
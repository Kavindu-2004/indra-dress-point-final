const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);

    await driver.get("http://localhost:3000/admin/products");
    console.log("Opened admin products page");

    const downloadButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Download Products')]")),
      10000
    );

    if (downloadButton) {
      console.log("PASS: Download Products button displayed");
    } else {
      console.log("FAIL: Download Products button not displayed");
    }
  } catch (error) {
    console.error("FAIL: Download products button test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
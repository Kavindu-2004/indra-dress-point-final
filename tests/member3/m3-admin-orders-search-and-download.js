const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);

    await driver.get("http://localhost:3000/admin/orders");
    console.log("Opened admin orders page");

    const searchInput = await driver.wait(
      until.elementLocated(By.css('input[placeholder*="Search id"]')),
      10000
    );

    const downloadButton = await driver.findElement(
      By.xpath("//button[contains(., 'Download Orders')]")
    );

    if (searchInput && downloadButton) {
      console.log("PASS: Search input and Download Orders button displayed");
    } else {
      console.log("FAIL: Search input or Download Orders button missing");
    }
  } catch (error) {
    console.error("FAIL: Admin orders search/download test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
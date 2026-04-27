const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);
    await driver.get("http://localhost:3000/admin/reports");
    console.log("Opened admin reports page");

    const rangeSelect = await driver.wait(
      until.elementLocated(By.tagName("select")),
      10000
    );

    await rangeSelect.sendKeys("Custom");
    await driver.sleep(1500);

    const dateInputs = await driver.findElements(By.css('input[type="date"]'));

    if (dateInputs.length >= 2) {
      console.log("PASS: Reports custom date range displayed");
    } else {
      console.log("FAIL: Reports custom date range not displayed");
    }
  } catch (error) {
    console.error("FAIL: Reports custom date range test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
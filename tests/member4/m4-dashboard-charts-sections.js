const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);
    await driver.get("http://localhost:3000/admin/dashboard");
    console.log("Opened admin dashboard");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);
    await driver.sleep(2000);

    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (
      bodyText.includes("Sales") &&
      bodyText.includes("Orders") &&
      bodyText.includes("Top Products") &&
      bodyText.includes("Download Chart")
    ) {
      console.log("PASS: Dashboard chart sections displayed");
    } else {
      console.log("FAIL: Dashboard chart sections missing");
    }
  } catch (error) {
    console.error("FAIL: Dashboard charts test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
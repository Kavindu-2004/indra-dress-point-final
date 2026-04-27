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

    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (
      bodyText.includes("Total Products") &&
      bodyText.includes("Total Orders") &&
      bodyText.includes("Pending Orders") &&
      bodyText.includes("Revenue")
    ) {
      console.log("PASS: Dashboard stat cards displayed");
    } else {
      console.log("FAIL: Dashboard stat cards missing");
    }
  } catch (error) {
    console.error("FAIL: Dashboard stat cards test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
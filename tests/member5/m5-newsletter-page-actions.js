const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);
    await driver.get("http://localhost:3000/admin/newsletter");
    console.log("Opened newsletter subscribers page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);
    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (
      bodyText.includes("Send Newsletter") &&
      bodyText.includes("Back to Dashboard")
    ) {
      console.log("PASS: Newsletter page action links displayed");
    } else {
      console.log("FAIL: Newsletter page action links missing");
    }
  } catch (error) {
    console.error("FAIL: Newsletter page actions test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
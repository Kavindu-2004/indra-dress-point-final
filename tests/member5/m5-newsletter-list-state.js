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
    await driver.sleep(1500);

    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (
      bodyText.includes("Loading subscribers...") ||
      bodyText.includes("No subscribers yet.") ||
      (bodyText.includes("ID") &&
        bodyText.includes("Email") &&
        bodyText.includes("Subscribed At"))
    ) {
      console.log("PASS: Newsletter list state handled");
    } else {
      console.log("FAIL: Newsletter list state not recognized");
    }
  } catch (error) {
    console.error("FAIL: Newsletter list state test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
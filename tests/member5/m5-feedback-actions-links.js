const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);
    await driver.get("http://localhost:3000/admin/feedback");
    console.log("Opened feedback management page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);
    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (
      bodyText.includes("Feedback Management") &&
      bodyText.includes("Back to Dashboard") &&
      bodyText.includes("Download Feedbacks")
    ) {
      console.log("PASS: Feedback action links displayed");
    } else {
      console.log("FAIL: Feedback action links missing");
    }
  } catch (error) {
    console.error("FAIL: Feedback action links test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
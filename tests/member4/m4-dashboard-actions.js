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
      bodyText.includes("Refresh") &&
      bodyText.includes("Announcements") &&
      bodyText.includes("Sales Report") &&
      bodyText.includes("Analyzer") &&
      bodyText.includes("View Feedbacks") &&
      bodyText.includes("Newsletter Subscribers") &&
      bodyText.includes("Manage Products") &&
      bodyText.includes("Sign out")
    ) {
      console.log("PASS: Dashboard action buttons displayed");
    } else {
      console.log("FAIL: Dashboard action buttons missing");
    }
  } catch (error) {
    console.error("FAIL: Dashboard actions test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
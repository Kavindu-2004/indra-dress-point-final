const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);
    await driver.get("http://localhost:3000/admin/announcements");
    console.log("Opened announcements page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);
    await driver.sleep(1500);

    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (
      bodyText.includes("Create announcement") &&
      bodyText.includes("All announcements") &&
      (bodyText.includes("No announcements yet.") ||
        bodyText.includes("Disable") ||
        bodyText.includes("Enable") ||
        bodyText.includes("Delete"))
    ) {
      console.log("PASS: Announcements list/actions displayed");
    } else {
      console.log("FAIL: Announcements list/actions missing");
    }
  } catch (error) {
    console.error("FAIL: Announcements list/actions test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
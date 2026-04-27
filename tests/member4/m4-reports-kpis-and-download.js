const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);
    await driver.get("http://localhost:3000/admin/reports");
    console.log("Opened admin reports page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);
    await driver.sleep(1500);

    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (
      bodyText.includes("Total Revenue") &&
      bodyText.includes("Total Orders") &&
      bodyText.includes("Items Sold") &&
      bodyText.includes("Avg Order Value") &&
      bodyText.includes("Shipping Collected") &&
      bodyText.includes("Customers") &&
      bodyText.includes("Order Status Breakdown") &&
      bodyText.includes("Category Performance") &&
      bodyText.includes("Download Report")
    ) {
      console.log("PASS: Reports KPI and download section displayed");
    } else {
      console.log("FAIL: Reports KPI or download section missing");
    }
  } catch (error) {
    console.error("FAIL: Reports KPI/download test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
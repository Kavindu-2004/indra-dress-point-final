const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);
    await driver.get("http://localhost:3000/admin/dashboard");
    console.log("Opened admin dashboard");

    const selects = await driver.wait(
      until.elementsLocated(By.tagName("select")),
      10000
    );

    if (selects.length > 0) {
      await selects[0].sendKeys("Custom");
      await driver.sleep(1500);

      const dateInputs = await driver.findElements(By.css('input[type="date"]'));

      if (dateInputs.length >= 2) {
        console.log("PASS: Custom range selection works");
      } else {
        console.log("FAIL: Custom date inputs not shown");
      }
    } else {
      console.log("FAIL: Range select not found");
    }
  } catch (error) {
    console.error("FAIL: Dashboard range select test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
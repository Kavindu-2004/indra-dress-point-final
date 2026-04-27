const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/admin/login");
    console.log("Opened admin login page");

    const emailInput = await driver.wait(
      until.elementLocated(By.css('input[type="email"]')),
      10000
    );

    const passwordInput = await driver.wait(
      until.elementLocated(By.css('input[type="password"]')),
      10000
    );

    await emailInput.clear();
    await emailInput.sendKeys("admin@indra.com");

    await passwordInput.clear();
    await passwordInput.sendKeys("Admin@123");

    const signInButton = await driver.findElement(
      By.xpath("//button[contains(., 'Sign in') or contains(., 'Login')]")
    );

    await signInButton.click();
    await driver.sleep(3000);

    const currentUrl = await driver.getCurrentUrl();
    const bodyText = await driver.findElement(By.tagName("body")).getText();

    console.log("Current URL:", currentUrl);
    console.log("Body text:");
    console.log(bodyText);

    if (
      currentUrl.includes("/admin/dashboard") ||
      currentUrl.includes("/admin/products")
    ) {
      console.log("PASS: Admin login successful");
    } else {
      console.log("FAIL: Admin login did not reach protected admin area");
    }
  } catch (error) {
    console.error("FAIL: Admin login failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
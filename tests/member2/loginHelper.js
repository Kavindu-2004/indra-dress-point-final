const { By, until } = require("selenium-webdriver");

async function adminLogin(driver) {
  await driver.get("http://localhost:3000/admin/login");

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

  // Wait until dashboard is really loaded
  await driver.wait(until.urlContains("/admin/dashboard"), 10000);
  await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Dashboard')]")), 10000);

  // Extra wait to ensure cookie/session is fully settled
  await driver.sleep(1500);

  // Debug: print cookies once
  const cookies = await driver.manage().getCookies();
  console.log(
    "Cookies after login:",
    cookies.map((c) => c.name)
  );
}

module.exports = { adminLogin };
const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/");
    console.log("Opened home page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const links = await driver.findElements(By.tagName("a"));
    let clickedLinkText = "";
    let foundNavigationLink = false;

    for (let link of links) {
      const text = (await link.getText()).trim().toLowerCase();
      const href = await link.getAttribute("href");

      // Only allow real store navigation links
      if (
        (href && href.includes("/products")) ||
        (href && href.includes("/category/new-arrivals")) ||
        (href && href.includes("/category/dresses"))
      ) {
        clickedLinkText = text || href || "";
        console.log("Clicking link:", clickedLinkText || href);
        await driver.executeScript("arguments[0].click();", link);
        foundNavigationLink = true;
        break;
      }
    }

    await driver.sleep(2000);

    const currentUrl = await driver.getCurrentUrl();
    console.log("Current URL:", currentUrl);

    if (
      foundNavigationLink &&
      (
        currentUrl.includes("/products") ||
        currentUrl.includes("/category/new-arrivals") ||
        currentUrl.includes("/category/dresses")
      )
    ) {
      console.log("PASS: Store navigation link works");
    } else {
      console.log("FAIL: Store navigation link not working");
    }
  } catch (error) {
    console.error("FAIL: Navbar navigation test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();
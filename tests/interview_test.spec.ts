import { test, expect } from '@playwright/test';

test('TC001 - Login to the site', async ({ page }) => {

  // Go to the SauceDemo site
  await page.goto('https://www.saucedemo.com/');

  // Log in using standard_user credentials
  //Fill user name
  const Username = '#user-name';
  await page.waitForSelector(Username, { state: 'visible', timeout: 50000 });
  await page.fill(Username, 'standard_user');

  //Fill password
  const password = '#password';
  await page.waitForSelector(password, { state: 'visible', timeout: 50000 });
  await page.fill(password, 'secret_sauce');

  //click login button
  const loginbutton = '#login-button';
  await page.waitForSelector(loginbutton, { state: 'visible', timeout: 50000 });
  await page.click(loginbutton);

  //Verify user is navigated to dashboard
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

  //3
// (a)Select the 'Price (high to low)' option
await page.selectOption('//*[@id="header_container"]/div[2]/div/span/select', 'hilo');

// Verify the selected value
const selectedValue = await page.$eval('//*[@id="header_container"]/div[2]/div/span/select', el => el.value);
console.log(`Selected sorting option: ${selectedValue}`);

// (b) Add the three cheapest products to the basket
const products = await page.$$('.inventory_item');

// Extract price and reference for each product
const productData = await Promise.all(products.map(async (product) => {
  const priceText = await product.$eval('.inventory_item_price', el => el.textContent || '');
  const price = parseFloat(priceText.replace('$', ''));
  return { product, price };
}));

// Sort products by ascending price (cheapest to high)
const cheapestThree = productData.sort((a, b) => a.price - b.price).slice(0, 3);

for (const item of cheapestThree) {
  const addButton = await item.product.$('button');
  if (addButton) await addButton.click();
}

// (c) Open the basket
const shopping_cart = '.shopping_cart_link'
await page.waitForSelector(shopping_cart, {state: 'visible', timeout: 60000});
await page.click(shopping_cart);
await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');

// (d) Remove the cheapest product from the basket
const removeButtons = page.locator('.cart_item .cart_button');
if (await removeButtons.count() > 0) {
  await removeButtons.first().click();
}

// Proceed to checkout
await page.click('[data-test="checkout"]');
await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');

// (e) Enter the name and postal code
await page.fill('[data-test="firstName"]', 'John');
await page.fill('[data-test="lastName"]', 'Doe');
await page.fill('[data-test="postalCode"]', '12345');
await page.click('[data-test="continue"]');

// (f) Complete the purchase
await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
await page.click('[data-test="finish"]');

// Verify the order completion
await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');

 // Pause the test execution to keep the browser open
 await page.pause();
});

  
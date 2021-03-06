import { WebElement, WebDriver } from 'selenium-webdriver';
import { GetWebElements } from './get_web_elements';
import { Element } from './';
import { elementArrayFinderFactory, ElementArrayFinder } from './all';
import { isProtractorLocator, Locator } from '../by/locator';
import { Rectangle, runAction, SharedResults, sharedResultsInit, TaskOptions, taskOptionsInit } from '../utils';

export function elementFinderFactory(
    driver: WebDriver|WebElement|Promise<WebDriver|WebElement>,
    locator: Locator): ElementFinder {
  let getWebElements: GetWebElements = async (): Promise<WebElement[]> => {
    const awaitedDriver = await driver;
    if (isProtractorLocator(locator)) {
      return locator.findElementsOverride(awaitedDriver, null);
    } else {
      return (await awaitedDriver).findElements(locator);
    }
  }
  return new ElementFinder(driver, locator, getWebElements);
}

export class ElementFinder {
  protected _taskOptions: TaskOptions;
  protected _sharedResults: SharedResults;
  constructor(
    protected _driver: WebDriver|WebElement|Promise<WebDriver|WebElement>,
    protected _locator: Locator,
    protected _getWebElements: GetWebElements) {
  }

  /**
   * Clears the text from an input or textarea web element.
   * @return A promise to this object.
   */
  async clear(): Promise<ElementFinder> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<void> => {
      const webElement = await this.getWebElement();
      await webElement.clear();
    };
    await runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
    return this;
  }

  /**
   * Clicks on a web element.
   * @return A promise to this object.
   */
  async click(): Promise<ElementFinder> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    // Gets the first web element matching the locator and clicks on it.
    const action = async (): Promise<void> => {
      const webElement = await this.getWebElement();
      await webElement.click();
    };
    await runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
    return this;
  }

  /**
   * The count of web elements.
   * @return A promise of the number of elements matching the locator.
   */
  count(): Promise<number> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async(): Promise<number> => {
      try {
        const webElements = await this._getWebElements();
        return webElements.length;
      } catch (err) {
        throw err;
      }
    };
    return runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
  }

  /**
   * Compares an element to this one for equality.
   * @param webElement The element to compare to.
   * @return A promise that will be resolved if they are equal.
   */
  async equals(webElement: ElementFinder | WebElement): Promise<boolean> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<boolean> => {
      const a = await this.getWebElement();
      const b = (webElement['getWebElement']) ?
        await (webElement as ElementFinder).getWebElement() :
        webElement as WebElement;
      const webElements = await this.getWebElement();
      const driver = await webElements.getDriver();
      return driver.executeScript<boolean>(
        'return arguments[0] === arguments[1]', a, b);
    };
    return runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
  }

  private buildElement(
      driver: WebDriver|WebElement|Promise<WebDriver|WebElement>): Element {
    let element: Element = (locator: Locator): ElementFinder => {
      const getDriver = async(): Promise<WebElement> => {
        const webElements = await this._getWebElements();
        return webElements[0];
      }
      const getWebElements: GetWebElements = async (): Promise<WebElement[]> => {
        const awaitedDriver = await getDriver();
        if (isProtractorLocator(locator)) {
          return locator.findElementsOverride(awaitedDriver, null);
        } else {
          return (await awaitedDriver).findElements(locator);
        }
      }
      return new ElementFinder(getDriver(), locator, getWebElements);
    }
    element['all'] = (locator: Locator): ElementArrayFinder => {
      return elementArrayFinderFactory(driver, locator);
    }
    return element;
  }

  element = this.buildElement(this._driver);

  /**
   * Creates an ElementFinder from either the WebDriver or within a WebElement.
   * @param driver The WebDriver or WebElement object.
   * @param locator The locator strategy.
   * @return The ElementFinder object.
   */
  static async fromWebElement(
      driver: WebDriver|WebElement|Promise<WebDriver|WebElement>,
      locator: Locator): Promise<ElementFinder> {
    let sharedResults = sharedResultsInit();
    let taskOptions = taskOptionsInit();
    const action = async(): Promise<ElementFinder> => {
      const getWebElements = async (): Promise<WebElement[]> => {
        const awaitedDriver = await driver;
        if (isProtractorLocator(locator)) {
          return locator.findElementsOverride(awaitedDriver, null);
        } else {
          return await awaitedDriver.findElements(locator);
        }
      }
      return new ElementFinder(driver, locator, getWebElements);
    };
    return runAction(action, taskOptions, sharedResults, driver);
  }

  /**
   * Gets the value of the provided attribute name.
   * @param attributeName The attribute key.
   * @param taskOptions Optional options for retries and functionHooks.
   * @param sharedResults Optional shared results to help debugging.
   * @return A promise to the attribute value.
   */
  getAttribute(attributeName: string): Promise<string> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<string> => {
      const webElement = await this.getWebElement();
      return webElement.getAttribute(attributeName);
    };
    return runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
  }

  /**
   * Retrieves the value of a computed style property for this instance.
   * @param cssStyleProperty The name of the CSS style property to look up.
   * @return A promise that will be resolved with the requested CSS value.
   */
  getCssValue(cssStyleProperty: string): Promise<string> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<string> => {
      const webElement = await this.getWebElement();
      return webElement.getCssValue(cssStyleProperty);
    };
    return runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
  }

  /**
   * Alias for getRect.
   */
  getLocation = this.getRect;

  /**
   * Returns an object describing an element's location, in pixels relative to
   * the document element, and the element's size in pixels.
   * @param taskOptions Optional options for retries and functionHooks.
   * @param sharedResults Optional shared results to help debugging.
   * @return A rectangle.
   */
  getRect(): Promise<Rectangle> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<Rectangle> => {
      const webElement = await this.getWebElement();
      return (webElement as any).getRect();
    }
    return runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
  }

  get sharedResults(): SharedResults {
    return this._sharedResults;
  }

  /**
   * Alias for getRect.
   */
  getSize = this.getRect;

  /**
   * Gets the tag name of the web element.
   * @return A promise to the tag name.
   */
  getTagName(): Promise<string> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<string> => {
      const webElement = await this.getWebElement();
      return webElement.getTagName();
    };
    return runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
  }

  /**
   * Gets the text contents from the html tag.
   * @return A promise to the text.
   */
  getText(): Promise<string> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<string> => {
      const webElement = await this.getWebElement();
      return webElement.getText();
    };
    return runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
  }

  /**
   * Returns the WebElement represented by this ElementFinder. This method does
   * not retry. Throws the WebDriver error if the element doesn't exist.
   * @return A promise of the WebElement.
   */
  async getWebElement(): Promise<WebElement> {
    const webElements = await this._getWebElements();
    return webElements[0];
  }

  /**
   * Whether the element is displayed.
   * @return A promise if the web element is displayed.
   */
  isDisplayed(): Promise<boolean> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<boolean> => {
      const webElement = await this.getWebElement();
      return webElement.isDisplayed();
    };
    return runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
  }

  /**
   * Alias for isPresent
   */
  isElementPresent = this.isPresent;

  /**
   * Whether the web element is enabled.
   * @return A promise if the web element is enabled.
   */
  isEnabled(): Promise<boolean> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<boolean> => {
      const webElement = await this.getWebElement();
      return webElement.isEnabled();
    };
    return runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
  }

  /**
   * Checks if the web element is present. If provided with a locatorOrElement,
   * it get the ElementFinder for the locatorOrElement
   * @param locator Opt locator to find a WebElement within this WebElement
   */
  async isPresent(locator?: Locator): Promise<boolean> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<boolean> => {
      if (locator) {
        // Get the element if it is within this element and check the count.
        const elementFinder = elementFinderFactory(
          await this.getWebElement(), locator);
        return await elementFinder.count() >= 1;
      } else {
        // The default action to check if this exists.
        return await this.count() >= 1;
      }
    };
    return runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
  }

  /**
   * Whether the element is currently selected.
   * @param taskOptions Optional options for retries and functionHooks.
   * @param sharedResults Optional shared results to help debugging.
   * @return A promise if the web element is selected.
   */
  isSelected(): Promise<boolean> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<boolean> => {
      const webElement = await this.getWebElement();
      return webElement.isSelected();
    };
    return runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
  }

  /**
   * Gets the locator strategy.
   * @return The locator object.
   */
  get locator(): Locator {
    return this._locator;
  }

  /**
   * Send keys to the input field.
   * @param keys
   * @return A promise to this object.
   */
  async sendKeys(keys: string|number): Promise<ElementFinder> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<void> => {
      const webElement = await this.getWebElement();
      return webElement.sendKeys(keys);
    };
    await runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
    return this;
  }

  /**
   * Submits the form containing this element.
   * @return A promise to this object.
   */
  async submit(): Promise<ElementFinder> {
    this._sharedResults = sharedResultsInit();
    this._taskOptions = taskOptionsInit();
    const action = async (): Promise<void> => {
      const webElement = await this.getWebElement();
      return webElement.submit();
    }
    await runAction(action, this._taskOptions,
      this._sharedResults, this._driver);
    return this;
  }
}
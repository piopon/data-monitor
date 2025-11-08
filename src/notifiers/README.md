# notifiers

This directory contains the logic for all supported notifier types.

### new notifier class requirements

The only requirement for the new notifier class is that it must implement the following method:

```js
/**
 * Method used to notify the user about data reaching threshold
 * @param {Object} data The notification values to be sent
 * @returns an object with notification send result and detailed information
 */
async notify(data) {
  // The input data has the following structure:
  // {
  //   name: [String] - contains monitor name,
  //   receiver: [String] - contains notification receiver email,
  //   avatar: [URL] - the URL to the avatar image,
  //   details: {
  //     message: [String] - notification message
  //     data: [String | Number] - current data value
  //     threshold: [String | Number] - monitor threshold value
  //   },
  // }
  // Check out src\lib\DataWorker.js for more details.

  // The output data should have the following structure:
  // {
  //   result: [Boolean] - whether or not the notification was sent successfully,
  //   info: [String] - details about notification send result
  // }
}
```

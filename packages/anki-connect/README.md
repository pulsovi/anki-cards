# AnkiConnect

A JavaScript - NodeJs wrapper to call [Anki-Connect API](https://foosoft.net/projects/anki-connect/index.html#supported-actions)

## Installation

Make sure you have correctly installed AnkiConnect plugin in your Anki app, following [AnkiConnect installation instructions](https://foosoft.net/projects/anki-connect/index.html#installation)

`npm install --save anki-connect`
OR
`yarn add anki-connect`

## Usage

AnkiConnect npm module provides a class which must be instantiated with the connection parameters

### Instanciation

```javascript:
const AnkiConnect = require('anki-connect');

/*
 * Default values are
 * url: http://127.0.0.1:8765
 * version: 6
 */
const ankiConnection = new AnkiConnect();
// ankiConnection url is "http://127.0.0.1:8765"

/*
 * It is possible to provide either
 * the full url
 */
const ankiConnectionUrl = new AnkiConnect({ url: 'http://0.0.0.0:8654' });
// ankiConnectionUrl url is "http://0.0.0.0:8654"

/*
 * ... or only ip or port value or both of them
 */
const ankiConnectionIp = new AnkiConnect({ ip: '0.0.0.0' });
// ankiConnectionIp url is "http://0.0.0.0:8765"
const ankiConnectionPort = new AnkiConnect({ port: 8654 });
// ankiConnectionPort url is "http://127.0.0.1:8654"
const ankiConnectionIpPort = new AnkiConnect({ ip: '0.0.0.0', port: 8654 });
// ankiConnectionIpPort url is "http://0.0.0.0:8654"
```

### Consume

The methods of the `ankiConnection` have the same name of the [AnkiConnect API "actions"](https://foosoft.net/projects/anki-connect/index.html#supported-actions) and return Promises.

Example:

```javascript:
const AnkiConnect = require('anki-connect');

const ankiConnection = new AnkiConnect();

ankiConnection.modelStyling({ modelName: 'Basic' }).then(css => {
  console.log('the css style code for the Basic model is:\n', css);
});
```

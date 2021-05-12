# extraTON extension
[![Chat on Telegram](https://img.shields.io/badge/chat-on%20Telegram-9cf.svg?logo=telegram&color=0088cc)](https://t.me/extraton)

Free TON wallet as browser extension.

![Extraton browser extension](img/main.png?raw=true)

## Details
Supported browsers: Google Chrome, Firefox, Opera, Edge, Brave.  
Languages: English, French, Spanish, Korean, Chinese, Russian.  
Contracts: Safe Multisig, Setcode Multisig, Surf.
Stack: vue.js, vuetify, dexie, ton-client-js.

Private keys and seed phrases are storing encoded in indexedDB with chacha20 encryption and user password. It decrypts only for sign messages by user confirmation.

## Architecture
![Architecture](img/architecture.png?raw=true)

## User Flow
![Architecture](img/userflow.png?raw=true)

## Installation
Download and unzip https://github.com/extraton/extraton-extension/raw/contest-stage-1/artifacts/extraton-v0.100.0-production.zip

### Google Chrome
Go to **chrome://extensions**, enable **Developer mode** in right top corner, press **Load Unpacked** and select unzipped folder with extension. Extension has installed, you can find it in browser toolbar under puzzle icon.

### Firefox
Go to **about:debugging#/runtime/this-firefox**, press **Load Temporary Add-on...** and select downloaded zip file with extension. Extension has installed, you can find it in browser toolbar under puzzle icon.

### Opera
Go to **opera://extensions**, enable **Developer mode** in right top corner, press **Load Unpacked** and select unzipped folder with extension. Extension has installed, you can find it in browser toolbar under puzzle icon.

### Edge
Go to **edge://extensions**, enable **Developer mode** in left bottom corner, press **Load Unpacked** and select unzipped folder with extension. Extension has installed, you can find it in browser toolbar under puzzle icon.


### Brave
Go to **brave://extensions**, enable **Developer mode** in right top corner, press **Load Unpacked** and select unzipped folder with extension. Extension has installed, you can find it in browser toolbar under puzzle icon.

## Code Verification (Experimental)

### Prepare code from store

Install CRX Extractor Extension to your Google Chrome.
Go to extraTON wallet google store page, open CRX Extractor Extension and click Download as ZIP.
Unzip it:
```
unzip hhimbkmlnofjdajamcojlcmgialocllm.zip -d ext
```
Remove metadata:
```
rm -rf ext/_metadata
```
Compress again:
```
tar -czvf ext.tar.gz ./ext
```
Get md5 hash:
```
md5 ext.tar.gz
```

### Prepare code from github
Clone and build project:
```
git clone https://github.com/extraton/extraton-extension.git
cd extraton-extension
git checkout {tag}
yarn install
yarn run build
```
Repack build and get md5 hash:
```
unzip artifacts/extraton-v{tag}-production.zip -d artifacts/ext
tar -czvf artifacts/ext.tar.gz artifacts/ext
md5 artifacts/ext.tar.gz
```

Compare md5 hashes.

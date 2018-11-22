## Generate ZilliqaJS SDK

```shell
cd deps
yarn add @zilliqa-js/zilliqa@next
# bn.js should be added with the above package. if it is not, install it manually.
yarn add bn.js

# bundle the sdk
yarn build
```

## Integrate to Creator Game

1. copy the bundled ZilliqaJS to your project's asset/script directory inside zilliqa-sdk folder, 
2. copy the A-zilliqa-polyfill-for-cocos.js to your project's asset/script. Make sure it will be loaded first.

## Sample

there have two Sample project:
* zilliqanetwork(https://github.com/paladinlll/zilliqa-cocos-sdk/tree/master/sample/zilliqanetwork) simplely use zilliqa sdk. Demo(https://cdn.rawgit.com/paladinlll/zilliqa-cocos-sdk/master/sample/build/web-mobile/index.html)
* tic-tak-toe use zilliqa sdk in a real game (to do)

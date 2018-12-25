
`1.Cocos HelloWorld` + `2.Zilliqa-js` + `3.Zilliqa Network` + `4.Zilliqa popup`
= `Hello Zilliqa`

## I. Init HelloWorld
Create new cocos creator project.\
![](./images/hz_1.png)![](./images/hz_2.png)
## II. Generate ZilliqaJS SDK
```shell
cd deps
yarn install

# bundle the sdk
yarn build
```

## III. Integrate to Creator Game
1. copy the `A-zilliqa-polyfill-for-cocos.js` to your project's asset/script. Make sure it will be loaded first.
2. copy the `zilliqa.cocos.js` to your project's asset/script directory inside zilliqa folder.
3. copy the `ZilliqaNetwork.ts` to your project's asset/script directory inside zilliqa folder.
![](./images/hz_3.png)

## IV. Add zilliqa popup
* Import `sample/zilliqanetwork.zip` to project.
* Create zilliqa popup in `HelloWorld` class.
![](./images/hz_4.png)
![](./images/hz_5.png)

## V. Sample
There have two Sample project:
* [zilliqanetwork](https://github.com/paladinlll/zilliqa-cocos-sdk/tree/master/sample/zilliqanetwork) the final of Hello Zilliqa project.
* [tic-tac-toe](https://github.com/paladinlll/zilliqa-cocos-sdk/tree/master/sample/tictactoe) use zilliqa sdk in a real game.

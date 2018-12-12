# TicTacToe
TicTacToe simplely use zilliqa cocos sdk
[Try Now](http://178.128.91.111:3000/assets/tictactoe/)

# Game flow
* `Alice` host new contract.
* `Alice` change contract status top open. (need this step because contract state was empty until it has a transaction)
* `Alice` give the contract address to `Bob` by some way.
* `Bob` import `Alice` contract to his list.
* `Bob` clicked on `Alice` contract.
* `Bob` clicked join and waiting for `Alice` accept.
* `Alice` accept `Bob` challenge.
* Change to game screen.

## Demo screen
### Host new contract
![](./../../images/ttt_1.png)
![](./../../images/ttt_2.png)

### Change contract state to open
![](./../../images/ttt_3.png)
![](./../../images/ttt_4.png)

### Import opponent contract
![](./../../images/ttt_5.png)

### Open opponent contract
![](./../../images/ttt_6.png)

### Challenge opponent
![](./../../images/ttt_7.png)
![](./../../images/ttt_8.png)

### Accept challenge
![](./../../images/ttt_9.png)

### Playing
![](./../../images/ttt_10.png)
![](./../../images/ttt_11.png)

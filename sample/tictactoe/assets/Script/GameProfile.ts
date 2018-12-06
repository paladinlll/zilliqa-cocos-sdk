import TicTacToeBinding from './contracts/TicTacToeBinding'

export default class GameProfile{
    private static instance: GameProfile = null;
        
    private constructor() {    
    }

    public static getInstance() {
        if (this.instance === null || this.instance === undefined) {
            this.instance = new GameProfile();            
        }
        return this.instance;
    }

    activeTicTacToeBinding:TicTacToeBinding = null;
}


export const initialState = {
    rounds : [],
    numberOfRounds: 5,
    currentRound:null,
    started:false
    
}
const round= {
    playerMove:null,
    computerMove:null,
    winner:null,
    captureAction: false,
    captureFinished: false,
    countDown:3,
    timeBeforeNextRound:5,
}

const moves =['rock','paper','scissors']

function makeMove(){
    return moves[Math.floor(Math.random()*2.99999999999)]
}

const gameResults = [
    {playerMove:'rock', computerMove:'rock', winner:'unknown'},
    {playerMove:'rock', computerMove:'paper', winner:'computer'},
    {playerMove:'rock', computerMove:'scissors', winner:'player'},
    {playerMove:'paper', computerMove:'rock', winner:'player'},
    {playerMove:'paper', computerMove:'paper', winner:'unknown'},
    {playerMove:'paper', computerMove:'scissors', winner:'computer'},
    {playerMove:'scissors', computerMove:'rock', winner:'computer'},
    {playerMove:'scissors', computerMove:'paper', winner:'player'},
    {playerMove:'scissors', computerMove:'scissors', winner:'unknown'},
];

function determineWinner(playerMove, computerMove){
    return gameResults.find(x => x.playerMove === playerMove && x.computerMove === computerMove).winner;
}

export function gameReducer(state, action){

    switch (action.type) {
        case 'start':
            return {...state, started:true, rounds:[],computerWins:0, playerWins:0, currentRound: {...round}};
        case 'count-down':
            if (state.currentRound?.countDown === 0)
                return state;
            const newCount = state.currentRound?.countDown -1;
            return {...state, currentRound:{...state.currentRound, countDown: newCount, captureAction: newCount === 0}};
        case 'count-down-in-between':
            if (state.currentRound?.timeBeforeNextRound === 0){
                
                return {...state, currentRound:{...round}, };
            }
            const timeBeforeNextRound = state.currentRound?.timeBeforeNextRound -1;
            return {...state, currentRound:{...state.currentRound, timeBeforeNextRound: timeBeforeNextRound}};
        case 'make-move':
            if (state.currentRound?.captureFinished)
                return state;
            
            const computerMove = makeMove()
            console.log(computerMove);
            const winner =determineWinner(action.payload.move, computerMove)
            const rounds = [...state.rounds];
            let computerWins = state.computerWins;
            let playerWins = state.playerWins;
            const currentRound ={...state.currentRound, 
                playerMove:action.payload.move,
                captureAction:false,
                captureFinished:true, 
                computerMove:computerMove,
                winner:winner}
            if (winner !== 'unknown'){
                rounds.push(currentRound)
                if (winner === 'computer')
                    computerWins +=1;
                if (winner === 'player')
                    playerWins +=1;
            
            }
            console.log(`Wins computer: ${computerWins}, player:${playerWins}`)
            return {...state, 
                currentRound:currentRound,rounds:rounds, computerWins: computerWins, playerWins:playerWins};
        
    }
}
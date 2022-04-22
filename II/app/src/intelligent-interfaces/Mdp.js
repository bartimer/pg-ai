import { moves } from "./GameReducer";

const combinations = [
    'paperrockW',
    'paperpaperW',
    'paperscissorsW',
    'rockrockW',
    'rockpaperW',
    'rockscissorsW',
    'scissorsrockW',
    'scissorspaperW',
    'scissorsscissorsW',
    'paperrockL',
    'paperpaperL',
    'paperscissorsL',
    'rockrockL',
    'rockpaperL',
    'rockscissorsL',
    'scissorsrockL',
    'scissorspaperL',
    'scissorsscissorsL',
    'paperrockD',
    'paperpaperD',
    'paperscissorsD',
    'rockrockD',
    'rockpaperD',
    'rockscissorsD',
    'scissorsrockD',
    'scissorspaperD',
    'scissorsscissorsD',
    
]
export class MarkovChain {
    order
    decay
    states = {}
    constructor(order, decay=1.0){
        this.order = order;
        this.decay = decay;
        this.createStates();
    }

    createStates(){
        combinations.forEach(x => this.states[x] = {
            'rock': {'prob' : 1 / 3, 'obs' : 1  },
            'paper': {'prob' : 1 / 3, 'obs' : 1  },
            'scissors': {'prob' : 1 / 3, 'obs' : 1  }
        })
    }

    updateState(pair, input){
        Object.keys(this.states).forEach(x => Object.keys(this.states[x]).forEach(y => this.states[x][y].obs = this.states[x][y].obs * this.decay));
        this.states[pair][input].obs += 1;
        
        Object.keys(this.states).forEach(x => {
            let total = 0;
            Object.keys(this.states[x]).forEach(y => total += this.states[x][y].obs);
            Object.keys(this.states[x]).forEach(y => this.states[x][y].prob = this.states[x][y].obs / total);
        });
        console.log(this.states);
    }

    predict(pair){
        
        const probs = this.states[pair];
        let max = Object.entries(probs).reduce((max, entry) => entry[1].prob >= max[1].prob ? entry : max, ['rock', {'prob':0}])
        let min = Object.entries(probs).reduce((min, entry) => entry[1].prob <= min[1].prob ? entry : min, ['rock', {'prob':1}])

        if (max[1] === min[1])
            return moves[Math.floor(Math.random()*2.99999999999)];
        if (max[0] == 'scissors') return 'rock';
        if (max[0] == 'rock') return 'paper';
        if (max[0] == 'paper') return 'scissors';
    }

}
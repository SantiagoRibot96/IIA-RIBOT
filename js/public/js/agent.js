export default class Agent {
    constructor(enviroment, policy, discountFactor = 0.1, learningRate = 0.1, explorationRatio = 0.9) {

        if(policy)
            this.q_table = policy;
        else{
            this.position = this.getShape(enviroment.policy);
            this.position.push(2);
            this.q_table = this.createQTable(this.position);
        }

        this.discountFactor = discountFactor;
        this.learningRate = learningRate;
        this.explorationRatio = explorationRatio;
    }

    getShape(policy) {
        let shape = [];
        let current = policy;
        while (Array.isArray(current)) {
            shape.push(current.length);
            current = current[0];
        }
        return shape;
    }

    createQTable(position) {

        const createArray = (dimensions) => {
            if(dimensions.length === 0) {
                return 0;
            }

            const size = dimensions[0];
            const restDimensions = dimensions.slice(1);
            const array =  new Array(size);

            for (let i = 0; i < size; i++) {
                array[i] = createArray(restDimensions);
            }

            return array;
        }

        return createArray(position);
    }

    getNextStep(state, enviroment) {
        let nextStep = this.randomChoice(1);
        if(Math.random() <= this.explorationRatio){
            const index = this.randomChoice(2, state);
            nextStep = enviroment.actions[index];
        }
        return nextStep;
    }

    randomChoice(opt, state) {
        if(opt === 1){
            const choice = Math.random();

            if(choice > 0.5) return "up";
            
            return "down";
        }else if(opt === 2) {
            const max = Math.max(...this.q_table[state[0]][state[1]][state[2]]);
            const index = [];

            for(let i = 0; i < this.q_table[state[0]][state[1]][state[2]].length; i++) {
                if(this.q_table[state[0]][state[1]][state[2]][i] === max){
                    index.push(i);
                }
            }
            const randomIndex = index[Math.floor(Math.random()*index.length)];
            return randomIndex;
        }
    }

    update(enviroment, oldState, action, reward, newState, end) {
        const actionIndex = enviroment.actions.findIndex(item => item === action);

        let currentQValueActions = this.q_table[oldState[0]][oldState[1]][oldState[2]];
        let currentQValue = currentQValueActions[actionIndex];

        let futureQValueActions = this.q_table[newState[0]][newState[1]][newState[2]];
        let variable = this.discountFactor*Math.max(...futureQValueActions);
        let futureMaxValue = reward + variable;

        if(end){
            futureMaxValue = reward;
        }

        this.q_table[oldState[0]][oldState[1]][oldState[2]][actionIndex] = currentQValue + this.learningRate*(futureMaxValue - currentQValue);
    }

    printPolicy() {
        // for(let row of this.q_table) {
        //     let rowStr = '';
        //     for(let column of row) {
        //         rowStr += '[';
        //         for(let value of column) {
        //             rowStr += value.toFixed(1).toString().padStart(6, ' ') + ' ';
        //         }
        //         rowStr += ']';
        //     }

        //     vconsole.log(rowStr.trim());
        // }

        console.log(this.q_table);
    }

    getPolicy() {
        return this.q_table;
    }
}
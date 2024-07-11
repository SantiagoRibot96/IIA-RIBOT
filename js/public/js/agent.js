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
        const container = document.getElementById('arrayContainer');
        container.innerHTML = '';

        // Recorremos el primer índice del array para generar cada cuadro
        for (let i = 0; i < this.q_table.length; i++) {
            const tableContainer = document.createElement('div');
            tableContainer.classList.add('table-container');
            tableContainer.innerHTML = `<h3>Cuadro ${i}</h3>`;

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            const headRow = document.createElement('tr');
            headRow.innerHTML = `<td></td><th COLSPAN=2>X0</th><th COLSPAN=2>X1</th><th COLSPAN=2>X2</th><th COLSPAN=2>X3</th><th COLSPAN=2>X4</th><th COLSPAN=2>X5</th><th COLSPAN=2>X6</th><th COLSPAN=2>X7</th><th COLSPAN=2>X8</th><th COLSPAN=2>X9</th>`;
            thead.appendChild(headRow);

            // Llenar tabla con datos
            for (let j = 0; j < this.q_table[i].length; j++) {

                const row = document.createElement('tr');
                row.innerHTML = `<th>${j}</th>`
                for (let k = 0; k < this.q_table[i][j].length; k++) {

                    const valorUp = this.q_table[i][j][k][0];
                    const valorDown = this.q_table[i][j][k][1];
                    
                    if(valorUp < 0.01 || valorDown < 0.01){
                        row.innerHTML += `
                            <td>${valorUp.toExponential(2)}</td>
                            <td>${valorDown.toExponential(2)}</td>
                        `;
                    }else{
                        row.innerHTML += `
                            <td>${valorUp.toFixed(2)}</td>
                            <td>${valorDown.toFixed(2)}</td>
                        `;
                    }
                    tbody.appendChild(row);
                }
            }

            table.appendChild(thead);
            table.appendChild(tbody);
            tableContainer.appendChild(table);
            container.appendChild(tableContainer);
            container.innerHTML += `<br>`;
        }
    }

    getPolicy() {
        return this.q_table;
    }
}
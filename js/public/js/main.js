import Enviroment from "./enviroment.js";
import Agent from "./agent.js";

const trainBtn = document.getElementById("trainBtn");
const playBtn = document.getElementById("playBtn");
const print = document.getElementById("print");

export const width_px = 50;
export const height_px = 40;
export const max_lives = 3;
export const max_score = 200;
export const mov = 5;

const defaultDiscountFactor = 0.1;
const defaultLearningRate = 0.1;
const defaultRounds = 5000;
const defaultExplorationRatio = 0.9;

let enviroment = new Enviroment();
let agent = new Agent(enviroment, enviroment.policy);

document.addEventListener("DOMContentLoaded", (e) => {
    console.log("Modulos cargados!");
});

trainBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("Entrenando!");

    const rounds = parseFloat(document.querySelector('input[name="rounds"]').value);
    const discountFactor = parseFloat(document.querySelector('input[name="discountFactor"]').value);
    const learningRate = parseFloat(document.querySelector('input[name="learningRate"]').value);
    const explorationRatio = parseFloat(document.querySelector('input[name="explorationRatio"]').value);

    console.log("Rounds: ", rounds||defaultRounds);
    console.log("Discount Factor: ", discountFactor||defaultDiscountFactor);
    console.log("Learning Rate: ", learningRate||defaultLearningRate);
    console.log("Exploration ratio: ", explorationRatio||defaultExplorationRatio);

    let res = await play(null, null, false, rounds||defaultRounds, discountFactor||defaultDiscountFactor, learningRate||defaultLearningRate, explorationRatio||defaultExplorationRatio);
    enviroment = res.enviroment;
    agent = res.agent;
});

playBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("Jugando!");
    //play(agent, enviroment, animate, rounds, discountFactor, learningRate, explorationRatio)
    await play(agent, enviroment, true, 1, 0.1, 0.1, 1);
});

print.addEventListener("click", async (e) => {
    e.preventDefault();
    
    agent.printPolicy();
});

const play = async (agent = null, enviroment = null, animate = false, rounds = defaultRounds, discountFactor = defaultDiscountFactor, learningRate = defaultLearningRate, explorationRatio = defaultExplorationRatio) => {
    let fakePolicy = null;
    const myDiv = document.getElementById("myDiv");
    if(!enviroment) {
        enviroment = new Enviroment(myDiv);
    }else fakePolicy = enviroment.policy;

    if(!agent) {
        console.log("Begin new training");
        agent = new Agent(enviroment, fakePolicy, discountFactor, learningRate, explorationRatio);
    }

    let firstMax = 0;
    let wins = 0;
    let max = -9999;
    let totalReward = 0;

    for(let playedGames = 0; playedGames < rounds; playedGames++) {
        let state = enviroment.reset();
        let reward = null;
        let done = null;
        let iteration = 0;
        let contador = 0;

        while(done != true && iteration < 3000 && enviroment.totalScore < max_score) {
            let oldState = state.slice();
            let nextAction = agent.getNextStep(state, enviroment);

            ({state, reward, done} = await enviroment.step(nextAction, animate));

            if(animate){
                await enviroment.plotFrame();
            }

            if(rounds > 1) {
                agent.update(enviroment, oldState, nextAction, reward, state, done)
            }
            iteration += 1;
        }

        totalReward += enviroment.totalScore;

        if(enviroment.totalScore >= max_score) wins++;

        if(enviroment.totalScore > max) {
            max = enviroment.totalScore;
            firstMax = playedGames;
        }

        if(playedGames%500 === 0 && playedGames > 1 && !animate) {
            contador += 1;
            console.log(`-- Games: [${playedGames}] -- AvgScore: [${(totalReward/(500*contador)).toFixed(2)}] -- AvgSteps: [${iteration}] -- MaxScore: [${max}] -- GameOfFirstMax: [${firstMax}] -- Wins: [${wins}]`);
            max = 0;
            firstMax = 0;
            totalReward = 0;
            wins = 0;
        }
    }

    if(!animate) console.log(agent.q_table);

    return {agent, enviroment}
}
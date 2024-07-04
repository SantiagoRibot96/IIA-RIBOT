// import {width_px, height_px, max_lives, max_score, mov} from "../app.js";
import {width_px, height_px, max_lives, max_score, mov} from "./main.js";

export default class Enviroment {
    constructor(myDiv) {
        this.actions = ['up', 'down'];
        this.state = [0, 0, 0];
        this.totalScore = 0;
        
        this.policy = [];
        for (let x = 0; x < height_px/mov; x++) {
            let layer = [];
                for (let y = 0; y < height_px/mov; y++) {
                    let row = [];
                    for (let z = 0; z < width_px/mov; z++) {
                        row.push(0);
                    }
                layer.push(row);
            }
            this.policy.push(layer);
        }

        this.lives = max_lives;
        this.penalty = 0;
        this.paddleHeight = height_px/4
        this.score = 0;
        this.player = height_px/2

        this.x = width_px/2
        this.y = height_px/2
        this.dx = mov
        this.dy = mov
        this.radio = 2.5;
        this.myDiv = myDiv;

        this.interval = null;
    }

    reset() {
        this.totalScore = 0;
        this.state = [0, 0, 0];
        this.lives = max_lives;
        this.score = 0
        this.x = width_px/2;
        this.y = height_px/2;
        return this.state;
    }

    async step(action, animate = false) {
        await this.applyAction(action, animate);
        let done = this.lives <= 0 ? true : false;
        let reward = this.score;
        reward += this.penalty;
        this.totalScore += reward;
        let state = this.state;
        return {state, reward, done}
    }

    async applyAction(action, animate) {
        if(action === "up") {
            this.player += mov;
        }else if(action === "down") {
            this.player -= mov;
        }

        this.advancePlayer();
        this.advanceFrame();

        // if(animate) {
        //     if (this.interval) clearInterval(this.interval);
        //     this.interval = setInterval(() => this.plotFrame(), 20);
        // }

        this.state = [Math.floor((this.player/mov))-1, Math.floor((this.y/mov))-1, Math.floor((this.x/mov))-1];
    }

    advancePlayer() {
        if(this.player + this.paddleHeight >= height_px) {
            this.player = height_px - this.paddleHeight;
        }else if(this.player <= 0) {
            this.player = this.paddleHeight;
        }
    }

    advanceFrame() {
        this.x += this.dx;
        this.y += this.dy;
        
        if(this.x <= 5 || this.x >= width_px) {
            this.dx = -this.dx;
            if(this.x <= 5) {
                let ret = this.detectColission();

                if(ret) {
                    this.score = 10;
                }else {
                    this.score = -10;
                    this.lives -= 1;

                    if(this.lives > 0) {
                        this.score = -20;
                        this.x = width_px/2;
                        this.y = height_px/2;
                        this.dx = mov;
                        this.dy = mov;
                    }
                }
            }
        }else {
            this.score = 0;
        }

        if(this.y <= 0 || this.y >= height_px) {
            this.dy = -this.dy;
            this.y <= 0 ? this.y = mov : this.y;
        }
    }

    async plotFrame() {
        const shapes = [{
            type: 'circle',
            xref: 'x',
            yref: 'y',
            x0: this.x,
            y0: this.y,
            x1: this.x+this.radio,
            y1: this.y+this.radio,
            fillcolor: 'slategray',
            line: {
            color: 'black'
            }
        },
        {
            type: 'rect',
            xref: 'x',
            yref: 'y',
            x0: 0,
            y0: this.player,
            x1: 5,
            y1: this.player + this.paddleHeight,
            fillcolor: 'gold',
            line: {
            color: 'none'
            }
        }];

        const annotations = [{
            x: 4,
            y: height_px,
            xref: 'x',
            yref: 'y',
            text: `SCORE: ${this.totalScore} LIFE: ${this.lives}`,
            showarrow: false,
            font: {
            size: 12
            }
        }];

        if(this.lives <= 0) {
            annotations.push({
                x: 10,
                y: height_px - 14,
                xref: 'x',
                yref: 'y',
                text: "GAME OVER",
                showarrow: false,
                font: {
                size: 16
                }
            });
        }else if (this.totalScore >= max_score) {
            annotations.push({
                x: 10,
                y: height_px - 14,
                xref: 'x',
                yref: 'y',
                text: "YOU WIN!",
                showarrow: false,
                font: {
                size: 16
                }
            });
        }

        const layout = {
            shapes: shapes,
            annotations: annotations,
            xaxis: {
                range: [0, width_px],
                showticklabels: true
            },
            yaxis: {
                range: [0, height_px],
                showticklabels: true
            },
            width: 500,
            height: 400,
            fillcolor: "black"
        }

        Plotly.react(this.myDiv, [], layout, {staticPlot: true});
        
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    detectColission() {
        if((this.player + this.paddleHeight >= (this.y-this.radio)) && (this.player <= (this.y+this.radio))){
            return true
        }else return false
    }
}
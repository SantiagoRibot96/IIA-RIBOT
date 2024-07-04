import numpy as np
import matplotlib.pyplot as plt
from random import randint
from time import sleep
from IPython.display import clear_output
from math import ceil,floor

#globales
height = 40
width = 50
mov = 5
lives = 3
maxScore = 500

class game:

    def __init__ (self):
        #inicializa la clase game con los atributos necesarios
        self.actions = ['Up', 'Down']
        self.state = [0, 0, 0]
        self.total_score = 0
        self.policy = np.array([[[0 for z in range(10)]
                                            for y in range(8)]
                                                for x in range(8)])
        self.lives = lives
        self.penality = 0

        self.paddleHeight = int(height/4)
        self.score = 0
        self.player = height/2

        self.x = randint(int(width/2), width)
        self.y = randint(0, height-10)
        self.dx = mov
        self.dy = mov
        self.radio = 2.5
        
    def reset(self):
        #resete el juego
        self.total_score = 0
        self.state = [0, 0, 0]
        self.lives = lives
        self.score = 0
        self.x = randint(int(width/2), width)
        self.y = randint(0, height-10)
        return self.state
    
    def step(self, action, animate = False):
        #hace un step del juego
        self.applyAction(action, animate)
        done = self.lives <= 0
        reward = self.score
        reward += self.penality
        self.total_score += reward
        return self.state, reward, done
    
    def applyAction(self, action, animate):
        #aplica la accion, chequeando que la paleta no se salga de los margenes
        if action == 'Up':
            self.player += mov
        elif action == 'Down':
            self.player -= mov

        self.advancePlayer()
        self.advanceFrame()

        if animate:
            clear_output(wait=True)
            fig = self.plot_frame()
            plt.show()

        self.state = (floor(self.player/mov)-2, floor(self.y/mov)-2, floor(self.x/mov)-2)

    def advancePlayer(self):

        if self.player + self.paddleHeight >= height:
            self.player = height - self.paddleHeight
        elif self.player <= -mov:
            self.player = -mov

    def advanceFrame(self):

        self.x += self.dx
        self.y += self.dy
        if self.x <= 3 or self.x > width:
            self.dx = -self.dx
            if self.x <= 3:
                ret = self.detectColission(self)

                if ret:
                    self.score = 10
                else:
                    self.score = -10
                    self.lives -= 1
                    if self.lives > 0:
                        self.x = randint(int(self.width_px/2), self.width_px)
                        self.y = randint(0, self.height_px-10)
                        self.dx = abs(self.dx)
                        self.dy = abs(self.dy)
        else:
            self.score = 0

        if self.y < 0 or self.y > height:
            self.dy = -self.dy

    def plot_frame(self):
        fig = plt.figure(figsize=(5, 4))
        a1 = plt.gca()
        ball = plt.Circle((self.x, self.y), self.radio, fc='slategray', ec='black')
        a1.set_ylim(-5, height+5)
        a1.set_xlim(-5, width+5)

        paddle = plt.Rectangle((-5, self.player), 5, self.paddleHeight, fc='gold', ex='none')
        a1.add_patch(ball)
        a1.add_patch(paddle)

        plt.text(4, height, "SCORE:"+str(self.total_score)+"   LIFE:"+str(self.lives), fontsize = 12)
        if self.lives <= 0:
            plt.text(10, height-14, "GAME OVER", fontsize = 16)
        elif self.total_score >= maxScore:
            plt.text(10, height-14, "YOU WIN", fontsize = 16)
        
        return fig
# Este programa resuelve un muy simple laberinto, compuesto por 6 bloques de un diagrama de flujos.
# La idea es entrenar una IA que lo resuelva en la menor cantidad de pasos
import numpy as np

# R matrix
R = np.matrix([ [-1,-1,-1,-1,0,-1],
                [-1,-1,-1,0,-1,100],
                [-1,-1,-1,0,-1,-1],
                [-1,0,0,-1,0,-1],
                [-1,0,0,-1,-1,100],
                [-1,0,-1,-1,0,100] ])
# En el estado 0 solo puedo ir al 4
# En el estado 1 puedo ir al 3 (sin penalidad) o al 5 (gano)
# En el estado 2 puedo ir sol al 3
# En el estado 3 puedo ir al 1, al 2 o al 4
# En el estado 4 puedo ir al 1, 2 o al 5 (gano)
# En el estado 5 puedo ir al 1, 4 o ganar 

# Q matrix
Q = np.matrix(np.zeros([6,6]))
# una matriz de 6x6 llena de ceros

# This function returns all available actions in the state given as an argument
def available_actions(state):
    current_state_row = R[state,]
    av_act = np.where(current_state_row >= 0)[1]
    return av_act
# Va a devolver solo las acciones posibles. Por ejemplo en el estado 3 va a devolver [1, 2, 4]

# This function chooses at random which action to be performed within the range 
# of all the available actions.
def sample_next_action(available_actions_range):
    next_action = int(np.random.choice(available_actions_range,1))
    return next_action
# Elige una opcion aleatorea de las posibles

# This function updates the Q matrix according to the path selected and the Q 
# learning algorithm
def update(current_state, action, gamma):
    
    max_index = np.where(Q[action,] == np.max(Q[action,]))[1]

    if max_index.shape[0] > 1:
        max_index = int(np.random.choice(max_index, size = 1))
    else:
        max_index = int(max_index)
    max_value = Q[action, max_index]
    
    # Q learning formula
    Q[current_state, action] = R[current_state, action] + gamma * max_value

# Gamma (learning parameter).
gamma = 0.8
# Initial state. (Usually to be chosen at random)
initial_state = 1
# Get available actions in the current state
available_act = available_actions(initial_state) 
# Sample next action to be performed
action = sample_next_action(available_act)
# Update Q matrix
update(initial_state,action,gamma)

#-------------------------------------------------------------------------------
# Training

# Train over 10 000 iterations. (Re-iterate the process above).
for i in range(10000):
    current_state = np.random.randint(0, int(Q.shape[0]))
    available_act = available_actions(current_state)
    action = sample_next_action(available_act)
    update(current_state,action,gamma)
    
# Normalize the "trained" Q matrix
print("Trained Q matrix:")
print(Q/np.max(Q)*100)

#-------------------------------------------------------------------------------
# Testing

# Goal state = 5
# Best sequence path starting from 2 -> 2, 3, 1, 5

current_state = 0
steps = [current_state]

while current_state != 5:

    next_step_index = np.where(Q[current_state,] == np.max(Q[current_state,]))[1]
    
    if next_step_index.shape[0] > 1:
        next_step_index = int(np.random.choice(next_step_index, size = 1))
    else:
        next_step_index = int(next_step_index)
    
    steps.append(next_step_index)
    current_state = next_step_index

# Print selected sequence of steps
print("Selected path:")
print(steps)

#-------------------------------------------------------------------------------
#                               OUTPUT
#-------------------------------------------------------------------------------
#
# Trained Q matrix:
#[[   0.     0.     0.     0.    80.     0. ]
# [   0.     0.     0.    64.     0.   100. ]
# [   0.     0.     0.    64.     0.     0. ]
# [   0.    80.    51.2    0.    80.     0. ]
# [   0.    80.    51.2    0.     0.   100. ]
# [   0.    80.     0.     0.    80.   100. ]]
#
# Selected path:
# [2, 3, 1, 5]
# 
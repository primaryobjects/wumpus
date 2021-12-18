Wumpus World
============

Navigate the dungeon. Avoid the pits. Find the gold. Beware of the Wumpus!

Artificial intelligence game, powered by logical and symbolic AI.

[Play Online](http://primaryobjects.github.io/wumpus/)

Read the full article [Designing an Artificial Intelligence Agent to Navigate a World](http://www.primaryobjects.com/2020/10/26/designing-an-artificial-intelligence-agent-to-navigate-a-world/).

## What is it?

Wumpus World (also called Hunt the Wumpus) is a dungeon crawling game where the player must navigate a dungeon in order to find the treasure. As the player enters each room, they will be able to perceive certain effects. The effects include a breeze, which indicates a pit is nearby in an adjacent room; a stench, which indicates a monster is in an adjacent room; and a glitter, which indicates the treasure is in an adjacent room.

The player must use the perception hints within each room in order to determine which room is safe to move to next. If the player enters a room containing a pit or wumpus, the game is over.

Wumpus World is used as a demonstration of applying artificial intelligence concepts to a discrete, deterministic, partially observable, single-player environment. In this environment, the player (or computer agent) has the ability to make decisions upon which action to take next in order to achieve the desired goal of finding the treasure and avoiding obstacles. The player or artificial intelligence agent is able to build knowledge-base of the dungeon layout and rooms as they obtain more hints and perceptions within their environment. In this manner, the player or AI can logically deduce which rooms contain obstacles and which rooms are deemed to be safe. For example, if the AI determines that one particular room contains a breeze, then moves to the right and up a room (diagonal to the initial room) and they perceive another breeze, they can reasonably deduce that the encircled room contains a pit, with a degree of accuracy.

Wumpus World and Hunt the Wumpus allows the application of many different types of artificial intelligence techniques. These include symbolic AI and logical-based AI for implementing predicate and first-order logic to calculate likelihoods of conditions within each room. It also allows application of AI algorithms such as neural networks, deep learning, and machine learning for training a neural network on a pre-existing data-set of acceptable moves given certain conditions on the map and the state of the player. The machine learning algorithm, using such a training set, can allow the AI to navigate to safe rooms, when a recognized or similar player and map state is presented. Genetic algorithms and evolutionary computation may also be used to train a neural network for learning the most optimal moves given a state on the board. When applying a genetic algorithm to a neural network (in place of a training-set), the AI can learn the best weights to apply to the nodes of the neural network in order to play an optimal game.

Wumpus World is developed in HTML and Javascript using React and Twitter Bootstrap.

## Game Objects

The following objects exist within the dungeon.

### Objects

- Pit: If the player enters a room with a pit, the game is over.
- Wumpus: If the player enters a room with a wumpus, the game is over.
- Gold: If the player enters a room with the gold, the player wins and the game is over.

### Senses

When the player enters a room with an adjacent room containing an item, they will be given a hint as a perceived sense. Senses are available for directly adjacent rooms, no diagonals.

- Breeze: A pit is nearby.
- Stench: A wumpus is nearby.
- Glitter: The gold is nearby.

## How is it Made?

Wumpus World is developed with Javascript, React, Twitter Bootstrap.

## License

MIT

## Author

Kory Becker
http://www.primaryobjects.com/kory-becker

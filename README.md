# Shooting Game

This is a simple 2D canvas game built with Javascript for client and NodeJS for server. I just made it for learning and demo purpose, as a result it is not a completed game.

## Installation

1. Clone the repository or download the source code.
2. Install node and npm LTS version [v16.19.1].
3. Install packages for client folder and server folder using `npm install`.
4. Install NestJS cli: `npm install -g @nestjs/cli`.
5. Once the installation finished, let's start everything up:
    - Run client: `cd /client && yarn start`
    - Run server: `cd /server && nest start --watch`
6. Parse the domain `localhost:8080` and open the game in your browser to play.
## How to play

- Controls:
    - Press A to move left, S to move down, D to move right, W to move up.
    - Press Q to unleash ultimate skill.
    - Mouse click to shoot bullet.
- Objective: Kills off other players.

## Features

- Shooting mechanics.
- Multiple buffs like speed up, damage up, healing, etc.
- Player skill with that deals huge damage.
- Multiple player can join the game with the help of backend server.

## Future enhancements

- Save player state and information.
- Sound integration.
- Additional skills and buffs.

## What I learnt through the project

- How Javascript canvas works.
- How client and server interact with each other.
- State and command pattern and how they can be applied in game development.
- Techniques for smoothing user experience: 
    - Client prediction.
    - Server reconciliation.
    - Entity interpolation.
## Demo

[Gameplay Video]()

## Contributing

Contributions to the project are welcome! If you find any bugs or have suggestions for new features, please open an issue or submit a pull request.

## Acknowledgements

Special thanks to the following resources and tutorials that helped in the development of this game:
- [Chris Courses](https://www.youtube.com/@ChrisCourses)

## Contact

For any inquiries or questions, please contact me at [conghuy.nguyentran.1999@gmail.com](mailto:conghuy.nguyentran.1999@gmail.com).

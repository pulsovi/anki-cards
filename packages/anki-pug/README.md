# Anki Pug

Provide a CLI app with some commands to manage your Anki models templated with Pug

## Installation

`npm install --save anki-pug`

## Usage

* Create a new repository to own your anki models as pug templates :
  `mkdir anki-models && cd anki-models && git init`
* Run `npm init` or `yarn init` to create the `package.json` file
* Make a folder to store the models : `mkdir models`
* Make a folder to store the tests : `mkdir tests`
* Create a config file to store the config :
  **modelsPath :** the path to the folder which contains the models, relative paths are accepted
    `echo 'modelsPath: ./models' >> ./.ankipugrc`
  **testsPath :** the path to the folder which contains the tests, relative paths are accepted
    `echo 'testsPath: ./tests' >> ./.ankipugrc`
* Install this module in the `anki-models` package : `npm install --save anki-pug` or `yarn add anki-pug`
* Run the `diff` command `npm run anki-pug diff` or `yarn anki-pug diff` to start the synchronization between HTML models in Anki and Pug models and follow the instructions of the command-line interface to create all the models in the repository.

## Contribution

Voir ma note Obsidian sur le sujet [Projet anki-pug](obsidian://open?vault=Mes%20Projets&file=Projet%20anki-pug)

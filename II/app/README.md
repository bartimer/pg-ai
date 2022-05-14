# SPA for Intelligent Interfaces Assignment

## Demo

[Demo of intelligent interfaces assigment](https://bartimer.github.io/pg-ai/#/intelligent-interfaces) Rock paper scissors.

## Details

You can find more details on the project and implementation [here](./rock_paper_scisors.pdf).

If you prefer a guided walktrough and demo, you can watch this [video](https://user-images.githubusercontent.com/120823/168426528-0c36e41a-4318-4eef-ae6c-e937ac2ff6f4.mp4).

## Running it locally

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### Important
Add the following to node_modules\@tensorflow-models\speech-commands\package.json
`"browser": { "fs": false, "path": false, "os": false}` to remove fs errors (caused by webpack 5)

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

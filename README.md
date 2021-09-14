# 2048-ish

This is a complete rebuild of the popular, original 2048 game. It is coded entirely from scratch and includes some minor differences in score tallying and tile creation.

## Links

You can play it here:
**https://jessezisme.github.io/2048-ish/**
<br>
You can also view the code and play it on my Codepen:
**https://codepen.io/jessezisme/**

## Development

This small project uses Webpack for bundling. To run it locally for development:

1. npm install
2. Run either **`npm run watch-dev`** or **`npm run watch-prod`**, which will run a webpack build in either development or production mode (code will be minified) and watch for changes.
3. In a separate terminal window, use **`npm run serve`** to run a browsersync local server and view at `http://localhost:4000/`. The port can be changed in the `serve` script of `package.json`.

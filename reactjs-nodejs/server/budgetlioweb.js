// server-wrapper.js
require("babel-register");

import app from './js';

function StartApp() {
    app();
}

export default StartApp();
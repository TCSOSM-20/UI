import { render } from 'react-dom';
import SkyquakeRouter from 'widgets/skyquake_container/skyquakeRouter.jsx';
const config = require('json!../config.json');

let context = require.context('./components', true, /^\.\/.*\.jsx$/);
let router = SkyquakeRouter(config, context);
let element = document.querySelector('#content');

render(router, element);



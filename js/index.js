import startApp from './glass.js';
import {loading} from './init.js';

(async () =>{
    await loading()
    startApp()
}) ()
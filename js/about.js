import startApp from './bust.js';
import {loading} from './init.js';

(async () =>{
    await loading()
    startApp()
}) ()
import startApp from './glass';
import {loading} from './init';

(async () =>{
    await loading()
    startApp()
}) ()
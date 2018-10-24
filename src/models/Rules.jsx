import events from 'events';
import axios from "axios";
import config from '../../package.json';

const auth = `?authorization=${localStorage.jwt}`;

const RuleData = [];

const Rules = new events.EventEmitter();
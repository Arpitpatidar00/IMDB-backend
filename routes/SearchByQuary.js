
import express from 'express';

import {SearchMoviData} from '../controllers/SearchBYQuary.js'

const router = express.Router();


router.post('/SearchByQyary', SearchMoviData);


export default router;

import express from 'express';

import {SearchMoviData} from '../controllers/SearchControler.js'

const router = express.Router();


router.get('/Search', SearchMoviData);


export default router;

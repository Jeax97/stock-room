import { Router } from 'express';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../controllers/locations';

export const locationsRouter = Router();

locationsRouter.get('/', getLocations);
locationsRouter.post('/', createLocation);
locationsRouter.put('/:id', updateLocation);
locationsRouter.delete('/:id', deleteLocation);

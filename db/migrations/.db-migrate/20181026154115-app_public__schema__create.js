/* This is boilerplate, you want the parent directory for the actual migrations */
import {up as dbUp, down as dbDown} from '../../scripts/migrate';
export const up = dbUp("2018_10_26__15_41_15-app_public.schema.create");
export const down = dbDown("2018_10_26__15_41_15-app_public.schema.create");

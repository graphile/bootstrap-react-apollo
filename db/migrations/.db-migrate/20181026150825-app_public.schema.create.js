/* This is boilerplate, you want the parent directory for the actual migrations */
  import {up as dbUp, down as dbDown} from '../../scripts/migrate';
  export const up = dbUp("2018_10_26__15_08_25-app_public.schema.create");
  export const down = dbUp("2018_10_26__15_08_25-app_public.schema.create");
  
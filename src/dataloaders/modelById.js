import dataloader from 'dataloader';

import { modelByField } from '.';

const modelById = Model => modelByField(Model, 'id');

export default modelById;

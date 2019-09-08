import dataloader from 'dataloader';

const modelByField = (Model, field) => (
  new dataloader(async (values) => {
    const models = await Model.findAll({ where: { [field]: values } });

    return values.map(value => models.find(model => model[field] == value));
  })
);

export default modelByField;

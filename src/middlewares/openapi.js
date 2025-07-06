import { OpenAPIBackend } from 'openapi-backend';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiDefinition = YAML.load(path.resolve(__dirname, '../../openapi/api.yaml'));

const api = new OpenAPIBackend({
  definition: apiDefinition,
  validate: true,
  customizeAjv: (ajv) => {
    addFormats(ajv);
    return ajv;
  }
});

api.register('notFound', (_, __, res) => {
  res.status(404).json({ error: 'Not found' });
});

api.register('validationFail', (c, __, res) => {
  res.status(400).json({ error: c.validation.errors });
});

api.register('unauthorizedHandler', (_, __, res) => {
  res.status(401).json({ error: 'Unauthorized' });
});

api.init();

export default api;
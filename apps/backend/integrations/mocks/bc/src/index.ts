import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const projects = [
  { externalId: 'BC-100', code: 'ALPHA', name: 'Proyecto Alpha', active: true },
  { externalId: 'BC-200', code: 'BETA', name: 'Proyecto Beta', active: true },
  { externalId: 'LOCAL-300', code: 'GAMMA', name: 'Proyecto Gamma', active: false }
];

app.get('/projects', (_req, res) => {
  res.json(projects);
});

app.get('/projects/:externalId', (req, res) => {
  const project = projects.find((p) => p.externalId === req.params.externalId);
  if (!project) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.json(project);
});

app.post('/webhook', (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT ?? 4100;
app.listen(port, () => {
  console.log(`BC mock escuchando en puerto ${port}`);
});

import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const leaves = [
  {
    userExternalId: 'mock-emp1',
    userId: 'mock-emp1',
    date: '2024-04-15',
    leaveTypeId: 'VAC',
    source: 'A3',
    approved: true,
    externalRef: 'a3-1'
  }
];

app.get('/leaves', (req, res) => {
  const { userExternalId } = req.query;
  if (!userExternalId) {
    return res.json([]);
  }
  const data = leaves.filter((leave) => leave.userExternalId === userExternalId);
  res.json(data);
});

app.post('/webhook', (req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`A3 mock escuchando en puerto ${port}`);
});

const pino = require('pino')();

app.addHook('onRequest', async (req, res) => {
  pino.info(req); });
app.addHook('onResponse', async (res) => {
  pino.info(res); });

app.listen(3000, (err, address) => {
  pino.info({ address: address,
              status: 'running'}); });

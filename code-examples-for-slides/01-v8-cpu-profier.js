const session = new require('inspector').Session();
session.connect();

app.get('/slow/', function slowHandler(req, res) {
  session.post('Profile.enable', () => {
    session.post('Profile.start', () => {
      heavyComputation.run();
      res.send({});
      session.post('Profile.stop', (err, { profile }) => {
        fs.writeFileSync(`slow.cpuprofile`, 
                         JSON.stringify(profile));
      });
    });
  });
});

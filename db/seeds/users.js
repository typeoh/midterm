exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return Promise.all([
        knex('users').insert({username:'aa', email:'a@a.a', password: '11aa'}),
        knex('users').insert({username:'bb', email:'b@b.c', password: '22bb'}),
        knex('users').insert({username:'cc', email:'c@c.c', password: '33cc'})
      ]);
    });
};

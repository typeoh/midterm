
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('tasks').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('tasks').insert({category: 'eat', content: 'sushi', date: '2017-06-21'}),
        knex('tasks').insert({category: 'read', content: 'Vancouver Sun', date: '2017-06-21'}),
        knex('tasks').insert({category: 'watch', content: 'Master of None', date: '2017-06-21'}),
        knex('tasks').insert({category: 'buy', content: 'slippers', date: '2017-06-21'}),
      ]);
    });
};

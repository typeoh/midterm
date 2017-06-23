exports.up = function(knex, Promise) {
  return knex.schema.createTable('taskClasses', function (table) {
    table.increments().primary();
    table.string('task');
    table.string('class');
  });
};
exports.down = function(knex, Promise) {
  return knex.schema.dropTable('taskClasses');
};

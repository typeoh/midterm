/*All users from users table*/
$(() => {
  $.ajax({
    method: "GET",
    url: "/api/users"
  }).done((users) => {
    for(user of users) {
      $("<div>").text(user.username).appendTo($("body"));
      $("<div>").text(user.email).appendTo($("body"));
      $("<div>").text(user.password).appendTo($("body"));
    }
  });;
})
/*All tasks from tasks table*/
$(() => {
  $.ajax({
    method: "GET",
    url: "/api/tasks"
  }).done((tasks) => {
    for(task of tasks) {
      $("<div>").text(task.category).appendTo($("body"));
    }
  });;
});

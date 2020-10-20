export default function (taskName) {
  this.taskName = taskName;
  this.toString = function() {
    return `Task '${this.taskName}' not exists.`;
  };
}
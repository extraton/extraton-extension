export default {
  request: function (task, parameters = {}) {
    const data = {method: task.name, data: parameters};
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(data, (response) => {
        console.log(response);
        if (0 !== response.code) {
          console.error(response);
          reject(response.error);
        } else {
          resolve(response.data);
        }
      });
    });
  },
}

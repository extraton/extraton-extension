export default function (networkId) {
  this.networkId = networkId;
  this.toString = function() {
    return `Network #${this.networkId} not configured in contract file.`;
  };
}
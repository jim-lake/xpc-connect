var events = require('events');

var binding = require('bindings')('xpc-connect.node');
var XpcConnect = binding.XpcConnect;

inherits(XpcConnect, events.EventEmitter);

function inherits(target, source) {
  for (var k in source.prototype) {
    target.prototype[k] = source.prototype[k];
  }
}

XpcConnect.prototype.sendMessageWithReply = sendMessageWithReply;
XpcConnect.prototype._emit = _emit;

let g_replyNum = 1;
const g_callbackMap = {};
function sendMessageWithReply(msg, cb) {
  const reply_num = g_replyNum++;
  g_callbackMap[reply_num] = cb;
  return this.sendMessage(msg, reply_num);
}
function _emit(reason, message, reply_num) {
  const cb = g_callbackMap[reply_num];
  if (cb) {
    delete g_callbackMap[reply_num];
    if (reason === 'error') {
      cb(message);
    } else {
      cb(null, message);
    }
  } else {
    this.emit(reason, message, reply_num);
  }
}
module.exports = XpcConnect;

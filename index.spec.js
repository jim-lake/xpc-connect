const xpcConnect = require('./index');

test('test bluetooth connectivity', done => {
  let bluedService = new xpcConnect('com.apple.blued');


  bluedService.on('error', function(message) {
    console.log('error: ' + JSON.stringify(message, undefined, 2));
  });
  
  
  bluedService.on('event', function(event) {
    console.log('event: ' + JSON.stringify(event, undefined, 2));
  });
  
  bluedService.setup();
  
  bluedService.sendMessage({
    kCBMsgId: 1, 
    kCBMsgArgs: {
      kCBMsgArgAlert: 1,
      kCBMsgArgName: 'node'
    }
  });
  
  setTimeout(function() {
    bluedService.shutdown();
    done();   
  }, 500);  
});

test('test2', done => {
  let service = new xpcConnect('com.ares.test.server', 0);


  service.on('error', function(message, reply_num) {
    console.log('error:', message, reply_num);
  });


  service.on('event', function(event, reply_num) {
    console.log('event:', event, reply_num);
  });

  service.setup();

  service.sendMessageWithReply({
    f: 33n,
    root: Buffer.from('62706c6973743137a048000000000000007f111070696e673a776974685265706c793a007f110f76333240303a38403136403f323400a048000000000000006466006f006f003500e0', 'hex'),
    proxynum: 1n,
    replysig: `v16@?0@"NSString"8`,
    sequence: 1n,
  }, (err, message) => {
    console.log("reply:", err, message);
  });

  setTimeout(function() {
    service.shutdown();
    done();
  }, 500);
});

test('multiple setups should fail', () => {
  let svc = new xpcConnect('com.apple.blued');
  svc.setup();
  expect(svc.setup).toThrow();
  svc.shutdown();
});

test('send before setup should fail', () => {
  let svc = new xpcConnect('com.apple.blued');
  expect(svc.sendMessage).toThrow();
});

test('can shutdown immediately after setup', () => {
  let svc = new xpcConnect('com.apple.blued');
  svc.setup();
  svc.shutdown();
});

test('can shutdown immediately after receiving message', done => {
  let svc = new xpcConnect('com.apple.blued');

  let fn = (response) => {
    console.log('response: ', JSON.stringify(response, undefined, 2));
    svc.shutdown();
    done();
  };
  svc.on('error', fn);
  svc.on('event', fn);

  svc.setup();
  svc.sendMessage({
    kCBMsgId: 1,
    kCBMsgArgs: {
      kCBMsgArgAlert: 1,
      kCBMsgArgName: 'node'
    }
  });
});

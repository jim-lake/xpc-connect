#ifndef ___XPC_CONNECTION_H___
#define ___XPC_CONNECTION_H___

#include <node.h>

#include <string>

#include <dispatch/dispatch.h>
#include <xpc/xpc.h>
#include <nan.h>

struct EventReply {
  xpc_object_t event;
  uint32_t reply_num;
  EventReply(xpc_object_t event, uint32_t reply_num): event(event), reply_num(reply_num) {};
};

class XpcConnect : public node::ObjectWrap {

public:
  static NAN_MODULE_INIT(Init);

  static NAN_METHOD(New);
  static NAN_METHOD(Setup);
  static NAN_METHOD(Shutdown);
  static NAN_METHOD(SendMessage);

private:
  XpcConnect(std::string serviceName, uint64_t flags);
  ~XpcConnect();

  static xpc_object_t ValueToXpcObject(v8::Local<v8::Value> object);
  static xpc_object_t ObjectToXpcObject(v8::Local<v8::Object> object);
  static xpc_object_t ArrayToXpcObject(v8::Local<v8::Array> array);

  static v8::Local<v8::Value> XpcObjectToValue(xpc_object_t xpcObject);
  static v8::Local<v8::Object> XpcDictionaryToObject(xpc_object_t xpcDictionary);
  static v8::Local<v8::Array> XpcArrayToArray(xpc_object_t xpcArray);

  static void AsyncCallback(uv_async_t* handle);
  static void AsyncCloseCallback(uv_async_t* handle);

  void setup();
  void shutdown();
  void sendMessage(xpc_object_t message, uint32_t reply_num);
  void queueEvent(xpc_object_t event, uint32_t reply_num);
  void processEventQueue();

private:
  std::string serviceName;
  uint64_t flags;
  dispatch_queue_t dispatchQueue;
  xpc_connection_t xpcConnection;
  bool calledSetup;
  bool calledShutdown;
  bool connectionClosed;

  Nan::AsyncResource* asyncResource;
  uv_async_t* asyncHandle;
  uv_mutex_t eventQueueMutex;
  std::queue<EventReply> eventQueue;

  static Nan::Persistent<v8::FunctionTemplate> constructor_template;
};

#endif
